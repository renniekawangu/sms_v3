import { deleteApp, initializeApp } from 'firebase/app'
import { doc, collection, getDoc, getDocs, addDoc, setDoc, updateDoc as firestoreUpdateDoc, deleteDoc as firestoreDeleteDoc, query as firestoreQuery, where as firestoreWhere, orderBy as firestoreOrderBy, limit as firestoreLimit, arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore'
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'
import { jsPDF } from 'jspdf'
import { auth, db, firebaseConfig } from './firebaseConfig'
import { ROLES } from '../config/rbac'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
export const AUTH_LOGOUT_EVENT = 'auth:logout'
const USE_FIRESTORE = Boolean(import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID)

const notifyUnauthorized = () => {
  localStorage.removeItem('user')

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT))
  }
}

const parseValue = (value) => {
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null
  const number = Number(value)
  return String(value).trim() !== '' && !Number.isNaN(number) ? number : value
}

const documentToObject = (snapshot) => ({ _id: snapshot.id, ...snapshot.data() })

const getCollectionRef = (path) => {
  const segments = path.split('/').filter(Boolean)
  if (segments.length === 0) {
    throw new Error('Collection path is required')
  }

  if (segments.length === 1) {
    return collection(db, segments[0])
  }

  const [collectionName, docId, ...rest] = segments
  let parentDoc = doc(db, collectionName, docId)
  if (rest.length === 0) {
    throw new Error(`Invalid collection path: ${path}`)
  }

  for (let i = 0; i < rest.length; i += 2) {
    const subCollectionName = rest[i]
    const nextDocId = rest[i + 1]
    if (!subCollectionName) break
    if (!nextDocId) {
      return collection(parentDoc, subCollectionName)
    }
    parentDoc = doc(collection(parentDoc, subCollectionName), nextDocId)
  }

  return collection(parentDoc, rest[rest.length - 1])
}

const getDocRef = (collectionPath, id) => {
  return doc(getCollectionRef(collectionPath), id)
}

const buildQuery = (collectionName, params = {}) => {
  let q = collection(db, collectionName)
  const clauses = []

  if (params.orderBy) {
    const direction = params.order === 'desc' ? 'desc' : 'asc'
    clauses.push(firestoreOrderBy(params.orderBy, direction))
  }

  if (params.limit) {
    const limitValue = Number(params.limit)
    if (!Number.isNaN(limitValue) && limitValue > 0) {
      clauses.push(firestoreLimit(limitValue))
    }
  }

  Object.entries(params).forEach(([key, value]) => {
    if (['orderBy', 'order', 'limit', 'page', 'q'].includes(key)) return
    if (value === undefined || value === null || value === '') return
    clauses.push(firestoreWhere(key, '==', parseValue(value)))
  })

  if (clauses.length === 0) return q
  return firestoreQuery(q, ...clauses)
}

const listDocuments = async (collectionName, params = {}) => {
  const q = buildQuery(collectionName, params)
  const snapshot = await getDocs(q)
  return snapshot.docs.map(documentToObject)
}

const getDocumentById = async (collectionName, id) => {
  const documentSnapshot = await getDoc(getDocRef(collectionName, id))
  if (!documentSnapshot.exists()) {
    throw new Error(`${collectionName} document not found: ${id}`)
  }
  return documentToObject(documentSnapshot)
}

const createDocument = async (collectionName, data, id) => {
  const now = Timestamp.now()
  const payload = {
    ...data,
    updatedAt: now,
    createdAt: now,
  }

  if (id) {
    const ref = getDocRef(collectionName, id)
    await setDoc(ref, payload, { merge: true })
    return { _id: id, ...payload }
  }

  const ref = await addDoc(collection(db, collectionName), payload)
  return { _id: ref.id, ...payload }
}

const createUserAccount = async (data) => {
  const { password, ...profileData } = data || {}
  const role = profileData.role || ROLES.STUDENT
  const now = Timestamp.now()

  if (password && profileData.email) {
    const secondaryApp = initializeApp(firebaseConfig, `user-create-${Date.now()}`)
    try {
      const secondaryAuth = getAuth(secondaryApp)
      const credential = await createUserWithEmailAndPassword(secondaryAuth, profileData.email, password)
      const uid = credential.user.uid
      const payload = {
        ...profileData,
        uid,
        user_id: uid,
        role,
        date_of_join: profileData.date_of_join || new Date().toISOString().split('T')[0],
        createdAt: now,
        updatedAt: now,
      }

      await setDoc(doc(db, 'users', uid), payload, { merge: true })
      await mirrorRoleProfile(uid, payload)
      return { _id: uid, ...payload }
    } finally {
      await deleteApp(secondaryApp)
    }
  }

  const createdUser = await createDocument('users', {
    ...profileData,
    role,
    date_of_join: profileData.date_of_join || new Date().toISOString().split('T')[0],
  })
  await mirrorRoleProfile(createdUser._id, createdUser)
  return createdUser
}

const updateDocument = async (collectionName, id, data) => {
  const ref = getDocRef(collectionName, id)
  await firestoreUpdateDoc(ref, {
    ...data,
    updatedAt: Timestamp.now(),
  })
  return getDocumentById(collectionName, id)
}

const deleteDocument = async (collectionName, id) => {
  await firestoreDeleteDoc(getDocRef(collectionName, id))
  return { success: true, id }
}

const splitName = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
  }
}

const getProfileId = (user = {}) => user._id || user.uid || user.user_id
const getDisplayName = (user = {}) => user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'User'

const userProfileToStudent = (user = {}) => {
  const id = getProfileId(user)
  const nameParts = splitName(user.name)
  const firstName = user.firstName || nameParts.firstName || user.email || 'Student'
  const lastName = user.lastName || nameParts.lastName || ''

  return {
    _id: id,
    userId: id,
    student_id: user.student_id || user.studentId || id,
    studentId: user.studentId || user.student_id || id,
    firstName,
    lastName,
    name: user.name || [firstName, lastName].filter(Boolean).join(' '),
    email: user.email || '',
    phone: user.phone || '',
    dob: user.dob || '2000-01-01',
    sex: user.sex || user.gender || '',
    address: user.address || '',
    date_of_join: user.date_of_join || new Date().toISOString().split('T')[0],
    parentId: user.parentId || '',
    role: ROLES.STUDENT,
  }
}

const userProfileToTeacher = (user = {}) => {
  const id = getProfileId(user)
  const nameParts = splitName(user.name)
  const firstName = user.firstName || nameParts.firstName || user.email || 'Staff'
  const lastName = user.lastName || nameParts.lastName || ''
  const role = user.role === ROLES.HEAD_TEACHER ? ROLES.HEAD_TEACHER : ROLES.TEACHER

  return {
    _id: id,
    userId: id,
    teacher_id: user.teacher_id || user.teacherId || id,
    teacherId: user.teacherId || user.teacher_id || id,
    firstName,
    lastName,
    name: user.name || [firstName, lastName].filter(Boolean).join(' '),
    email: user.email || '',
    phone: user.phone || '',
    dob: user.dob || '1980-01-01',
    sex: user.sex || user.gender || '',
    address: user.address || '',
    date_of_join: user.date_of_join || new Date().toISOString().split('T')[0],
    department: user.department || (role === ROLES.HEAD_TEACHER ? 'Administration' : 'Teaching'),
    role,
  }
}

const userProfileToParent = (user = {}) => {
  const nameParts = splitName(user.name)
  const id = getProfileId(user)
  return {
    _id: id,
    userId: id,
    firstName: user.firstName || nameParts.firstName || user.email || 'Parent',
    lastName: user.lastName || nameParts.lastName || '',
    name: getDisplayName(user),
    email: user.email || '',
    phone: user.phone || '',
    relationship: user.relationship || 'Guardian',
    address: user.address || '',
    occupation: user.occupation || '',
    students: user.students || [],
    role: ROLES.PARENT,
  }
}

const mirrorRoleProfile = async (id, user = {}) => {
  if (user.role === ROLES.STUDENT) {
    await setDoc(doc(db, 'students', id), userProfileToStudent({ ...user, _id: id }), { merge: true })
  }

  if (user.role === ROLES.TEACHER || user.role === ROLES.HEAD_TEACHER) {
    await setDoc(doc(db, 'teachers', id), userProfileToTeacher({ ...user, _id: id }), { merge: true })
  }

  if (user.role === ROLES.PARENT) {
    await setDoc(doc(db, 'parents', id), userProfileToParent({ ...user, _id: id }), { merge: true })
  }
}

const mergeRoleProfiles = async (collectionName, roleList, mapper, queryParams = {}) => {
  const [profileDocs, users] = await Promise.all([
    listDocuments(collectionName, queryParams),
    Promise.all(roleList.map((role) => listDocuments('users', { role }))).then((results) => results.flat()),
  ])

  const profilesById = new Map(profileDocs.map((profile) => [profile._id, profile]))

  users.forEach((user) => {
    const id = getProfileId(user)
    if (!profilesById.has(id)) {
      profilesById.set(id, mapper(user))
    }
  })

  return Array.from(profilesById.values())
}

const listStudentProfiles = (queryParams = {}) => {
  return mergeRoleProfiles('students', [ROLES.STUDENT], userProfileToStudent, queryParams)
}

const listTeacherProfiles = (queryParams = {}) => {
  return mergeRoleProfiles('teachers', [ROLES.TEACHER, ROLES.HEAD_TEACHER], userProfileToTeacher, queryParams)
}

const listParentProfiles = async (queryParams = {}) => {
  return mergeRoleProfiles('parents', [ROLES.PARENT], userProfileToParent, queryParams)
}

const getCurrentUserProfile = async () => {
  const firebaseUser = auth.currentUser
  if (!firebaseUser) {
    throw new Error('Not authenticated')
  }

  const profileRef = doc(db, 'users', firebaseUser.uid)
  const profileSnapshot = await getDoc(profileRef)
  if (profileSnapshot.exists()) {
    return documentToObject(profileSnapshot)
  }

  const fallbackProfile = {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    role: ROLES.STUDENT,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  await setDoc(profileRef, fallbackProfile)
  return { _id: firebaseUser.uid, ...fallbackProfile }
}

const createReceiptPdfBlob = async (payment) => {
  const docPdf = new jsPDF()
  const title = payment.receiptNumber ? `Receipt ${payment.receiptNumber}` : 'Payment Receipt'

  docPdf.setFontSize(18)
  docPdf.text(title, 20, 25)
  docPdf.setFontSize(12)
  docPdf.text(`Date: ${payment.date || new Date().toLocaleDateString()}`, 20, 40)
  docPdf.text(`Amount: ${payment.amount || payment.total || 'N/A'}`, 20, 50)
  docPdf.text(`Student: ${payment.studentName || payment.student?.name || 'N/A'}`, 20, 60)
  if (payment.description) {
    docPdf.text(`Description: ${payment.description}`, 20, 70)
  }

  const blob = docPdf.output('blob')
  return blob
}

const resolveCollection = (pathSegment) => {
  const maps = {
    'academic-years': 'academicYears',
    'fee-structures': 'feeStructures',
    'timetable/schedules': 'timetableSchedules',
    'timetable/instructors': 'timetableInstructors',
    'timetable/courses': 'timetableCourses',
    'fee-structures': 'feeStructures',
    'holidays': 'holidays',
    'audit-logs': 'auditLogs',
    'search': 'users',
  }
  return maps[pathSegment] || pathSegment
}

const firestoreRequest = async (method, endpoint, body, queryParams = {}) => {
  const rawPath = endpoint.replace(/\/+/g, '/').replace(/^\//, '').replace(/\/$/, '')
  const segments = rawPath.split('/').filter(Boolean)
  if (segments.length === 0) {
    return {}
  }

  const [resource, first, second, third, fourth] = segments

  // Auth routes
  if (resource === 'auth') {
    if (first === 'login' && method === 'POST') {
      return authApi.login(body.email, body.password)
    }
    if (first === 'logout' && method === 'POST') {
      return authApi.logout()
    }
    if (first === 'me' && method === 'GET') {
      return authApi.me()
    }
  }

  const getResourceName = () => {
    if (resource === 'accounts' && first) {
      return resolveCollection(first)
    }
    if (resource === 'timetable' && first) {
      return resolveCollection(`${resource}/${first}`)
    }
    if (resource === 'settings' && first) {
      return resolveCollection(first)
    }
    if (resource === 'admin' && ['staff-list', 'students-list'].includes(first)) {
      return 'users'
    }
    return resolveCollection(resource)
  }

  const collectionName = getResourceName()

  if (resource === 'users') {
    if (method === 'POST' && segments.length === 1) {
      return createUserAccount(body)
    }

    if ((method === 'PUT' || method === 'PATCH') && segments.length === 2) {
      const { password, ...profileData } = body || {}
      return updateDocument('users', first, profileData)
    }
  }

  if (resource === 'students' && method === 'GET' && segments.length === 1) {
    return listStudentProfiles(queryParams)
  }

  if (resource === 'teachers' && method === 'GET' && segments.length === 1) {
    return listTeacherProfiles(queryParams)
  }

  // Generic CRUD
  const isResultsPendingRoute = resource === 'results' && segments.length === 2 && first === 'pending' && method === 'GET'
  const isFirestoreCrudResource = resource !== 'settings' && resource !== 'admin' && resource !== 'timetable' && resource !== 'accounts' && ['students', 'teachers', 'classrooms', 'subjects', 'exams', 'fees', 'payments', 'expenses', 'issues', 'users', 'roles', 'academicYears', 'feeStructures', 'holidays', 'timetableSchedules', 'timetableInstructors', 'timetableCourses', 'results', 'homework', 'attendance'].includes(collectionName) && !isResultsPendingRoute

  if (isFirestoreCrudResource) {
    if (method === 'GET' && segments.length === 1) {
      return listDocuments(collectionName, queryParams)
    }

    if (segments.length === 2) {
      const id = first
      if (method === 'GET') return getDocumentById(collectionName, id)
      if (method === 'PUT' || method === 'PATCH') return updateDocument(collectionName, id, body)
      if (method === 'DELETE') return deleteDocument(collectionName, id)
    }

    if (segments.length === 1 && method === 'POST') {
      return createDocument(collectionName, body)
    }
  }

  if (resource === 'timetable') {
    if (first === 'schedules' && segments.length === 2 && method === 'GET') {
      return listDocuments('timetableSchedules', queryParams)
    }
    if (first === 'schedules' && segments.length === 3 && method === 'GET') {
      return getDocumentById('timetableSchedules', second)
    }
    if (first === 'schedules' && second === 'classroom' && third && method === 'GET') {
      return listDocuments('timetableSchedules', { classroomId: third, ...queryParams })
    }
    if (first === 'schedules' && second === 'instructor' && third && method === 'GET') {
      return listDocuments('timetableSchedules', { instructorId: third, ...queryParams })
    }
    if (first === 'schedules' && segments.length === 2 && method === 'POST') {
      return createDocument('timetableSchedules', body)
    }
    if (first === 'schedules' && segments.length === 3 && method === 'PUT') {
      return updateDocument('timetableSchedules', second, body)
    }
    if (first === 'schedules' && segments.length === 3 && method === 'DELETE') {
      return deleteDocument('timetableSchedules', second)
    }

    if (first === 'courses' && segments.length === 2 && method === 'GET') {
      return listDocuments('timetableCourses', queryParams)
    }
    if (first === 'courses' && segments.length === 3 && method === 'GET') {
      return getDocumentById('timetableCourses', second)
    }
    if (first === 'courses' && second === 'classroom' && third && method === 'GET') {
      return listDocuments('timetableCourses', { classroomId: third, ...queryParams })
    }
    if (first === 'courses' && segments.length === 2 && method === 'POST') {
      return createDocument('timetableCourses', body)
    }
    if (first === 'courses' && segments.length === 3 && method === 'PUT') {
      return updateDocument('timetableCourses', second, body)
    }
    if (first === 'courses' && segments.length === 3 && method === 'DELETE') {
      return deleteDocument('timetableCourses', second)
    }
  }

  // Attendance endpoints
  if (resource === 'attendance') {
    if (method === 'GET' && segments.length === 1) {
      return listDocuments('attendance', queryParams)
    }
    if (method === 'GET' && segments.length === 2) {
      return listDocuments('attendance', { user_id: first })
    }
    if (method === 'POST' && segments.length === 1) {
      return createDocument('attendance', body)
    }
    if (method === 'PUT' && first === 'record' && second) {
      return updateDocument('attendance', second, body)
    }
    if (method === 'DELETE' && first === 'record' && second) {
      return deleteDocument('attendance', second)
    }
  }

  // Fee and payment admin endpoints
  if (resource === 'accounts') {
    if (first === 'fees' && method === 'GET') {
      return listDocuments('fees', queryParams)
    }
    if (first === 'fees' && method === 'POST') {
      return createDocument('fees', body)
    }
    if (first === 'payments' && method === 'GET') {
      return listDocuments('payments', queryParams)
    }
    if (first === 'payments' && method === 'POST') {
      return createDocument('payments', body)
    }
    if (first === 'expenses' && method === 'GET') {
      return listDocuments('expenses', queryParams)
    }
    if (first === 'expenses' && method === 'POST') {
      return createDocument('expenses', body)
    }
    if (first === 'dashboard' && method === 'GET') {
      const [fees, payments, expenses] = await Promise.all([listDocuments('fees'), listDocuments('payments'), listDocuments('expenses')])
      return { fees: fees.length, payments: payments.length, expenses: expenses.length }
    }
    if (first === 'reports' && method === 'GET') {
      const [fees, payments] = await Promise.all([listDocuments('fees'), listDocuments('payments')])
      return { feeTotal: fees.reduce((sum, item) => sum + (item.amount || 0), 0), paymentTotal: payments.reduce((sum, item) => sum + (item.amount || 0), 0) }
    }
  }

  // Settings endpoints
  if (resource === 'settings') {
    if (first === undefined && method === 'GET') {
      return getDocumentById('settings', 'school').catch(() => ({}))
    }
    if (first === undefined && method === 'POST') {
      const ref = doc(db, 'settings', 'school')
      await setDoc(ref, { ...body, updatedAt: Timestamp.now() }, { merge: true })
      return getDocumentById('settings', 'school')
    }
    if (first === 'academic-years') {
      if (method === 'GET' && !second) return listDocuments('academicYears', queryParams)
      if (method === 'POST') return createDocument('academicYears', body)
      if (method === 'PUT' && second) return updateDocument('academicYears', second, body)
      if (method === 'DELETE' && second) return deleteDocument('academicYears', second)
      if (second === 'set-current' && method === 'POST') {
        await setDoc(doc(db, 'settings', 'school'), { currentAcademicYear: queryParams.year_id || body.year_id, updatedAt: Timestamp.now() }, { merge: true })
        return getDocumentById('settings', 'school')
      }
    }
    if (first === 'fee-structures') {
      if (method === 'GET' && !second) return listDocuments('feeStructures', queryParams)
      if (method === 'POST') return createDocument('feeStructures', body)
      if (method === 'PUT' && second) return updateDocument('feeStructures', second, body)
      if (method === 'DELETE' && second) return deleteDocument('feeStructures', second)
    }
    if (first === 'holidays') {
      if (method === 'GET') return listDocuments('holidays', queryParams)
      if (method === 'POST') return createDocument('holidays', body)
      if (method === 'DELETE' && second) return deleteDocument('holidays', second)
    }
  }

  // Admin endpoints
  if (resource === 'admin') {
    if (first === 'dashboard' && method === 'GET') {
      const [users, students, teachers, payments] = await Promise.all([listDocuments('users'), listDocuments('students'), listDocuments('teachers'), listDocuments('payments')])
      return { users: users.length, students: students.length, teachers: teachers.length, payments: payments.length }
    }
    if (first === 'users' && method === 'GET') {
      return listDocuments('users', queryParams)
    }
    if (first === 'reports' && method === 'GET') {
      return { message: 'Use account and fees reports from Firestore collections.' }
    }
    if (first === 'audit-logs' && method === 'GET') {
      return listDocuments('auditLogs', queryParams)
    }
    if (first === 'search' && method === 'GET') {
      const q = queryParams.q?.toLowerCase() || ''
      const results = await listDocuments('users')
      return results.filter((item) => item.name?.toLowerCase().includes(q) || item.email?.toLowerCase().includes(q))
    }
    if (first === 'staff-list' && method === 'GET') {
      return listDocuments('users', { role: ROLES.TEACHER })
    }
    if (first === 'students-list' && method === 'GET') {
      return listDocuments('users', { role: ROLES.STUDENT })
    }
  }

  // Teacher endpoints
  if (resource === 'teacher') {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('Authentication required for teacher endpoints')
    }
    if (first === 'dashboard' && method === 'GET') {
      const classrooms = await listDocuments('classrooms', { teacher_id: currentUser.uid })
      const subjects = await listDocuments('subjects', { teacher_id: currentUser.uid })
      return { classrooms: classrooms.length, subjects: subjects.length }
    }
    if (first === 'classes' && method === 'GET') {
      return listDocuments('classrooms', { teacher_id: currentUser.uid })
    }
    if (first === 'students' && method === 'GET') {
      return listDocuments('students', { teacher_id: currentUser.uid })
    }
    if (first === 'classrooms' && second === undefined && method === 'GET') {
      return listDocuments('classrooms', { teacher_id: currentUser.uid })
    }
    if (first === 'classroom' && second && third === 'students' && method === 'GET') {
      return listDocuments('students', { classroom_id: second })
    }
    if (first === 'subjects' && method === 'GET') {
      return listDocuments('subjects', { teacher_id: currentUser.uid })
    }
    if (first === 'attendance' && second === undefined && method === 'GET') {
      return listDocuments('attendance', { teacher_id: currentUser.uid })
    }
    if (first === 'attendance' && second === 'mark' && method === 'POST') {
      return createDocument('attendance', body)
    }
    if (first === 'grades' && method === 'GET') {
      return listDocuments('results', { teacher_id: currentUser.uid })
    }
    if (first === 'grades' && method === 'POST') {
      return createDocument('results', body)
    }
    if (first === 'performance' && method === 'GET') {
      const results = await listDocuments('results', { teacher_id: currentUser.uid })
      return { results: results.length }
    }
  }

  // Student endpoints
  if (resource === 'student') {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('Authentication required for student endpoints')
    }
    if (first === 'dashboard' && method === 'GET') {
      const profile = await getCurrentUserProfile()
      return { name: profile.name, role: profile.role }
    }
    if (first === 'profile' && method === 'GET') {
      return getCurrentUserProfile()
    }
    if (first === 'profile' && method === 'PUT') {
      const profileRef = doc(db, 'users', currentUser.uid)
      await firestoreUpdateDoc(profileRef, body)
      return getCurrentUserProfile()
    }
    if (first === 'grades' && method === 'GET') {
      const profile = await getCurrentUserProfile()
      return listDocuments('results', { studentId: profile.studentId || currentUser.uid })
    }
    if (first === 'attendance' && method === 'GET') {
      const profile = await getCurrentUserProfile()
      return listDocuments('attendance', { studentId: profile.studentId || currentUser.uid })
    }
    if (first === 'fees' && method === 'GET') {
      const profile = await getCurrentUserProfile()
      return listDocuments('fees', { studentId: profile.studentId || currentUser.uid })
    }
    if (first === 'subjects' && method === 'GET') {
      return listDocuments('subjects', queryParams)
    }
    if (first === 'exams' && method === 'GET') {
      return listDocuments('exams', queryParams)
    }
    if (first === 'timetable' && method === 'GET') {
      return listDocuments('timetableSchedules', queryParams)
    }
  }

  // Head teacher endpoints
  if (resource === 'head-teacher') {
    if (first === 'dashboard' && method === 'GET') {
      return { message: 'Head teacher dashboard is available through Firestore collections.' }
    }
    if (first === 'students' && method === 'GET') {
      return listDocuments('students', queryParams)
    }
    if (first === 'subjects' && method === 'GET') {
      return listDocuments('subjects', queryParams)
    }
    if (first === 'staff' && method === 'GET') {
      return listDocuments('teachers', queryParams)
    }
    if (first === 'attendance-analytics' && method === 'GET') {
      const attendance = await listDocuments('attendance')
      return { total: attendance.length }
    }
    if (first === 'performance' && method === 'GET') {
      const results = await listDocuments('results')
      return { total: results.length }
    }
  }

  // Parents endpoints
  if (resource === 'parents') {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('Authentication required for parent endpoints')
    }
    if (segments.length === 1 && method === 'GET') {
      return listParentProfiles(queryParams)
    }
    if (segments.length === 2 && method === 'PUT') {
      await setDoc(doc(db, 'parents', first), {
        ...body,
        updatedAt: Timestamp.now(),
      }, { merge: true })
      return getDocumentById('parents', first)
    }
    if (segments.length === 2 && method === 'DELETE') {
      return deleteDocument('parents', first)
    }
    if (first === 'dashboard' && method === 'GET') {
      return { message: 'Parent dashboard is powered by Firestore collections.' }
    }
    if (first === 'children' && second === undefined && method === 'GET') {
      const profile = await getCurrentUserProfile()
      return listDocuments('students', { parentId: currentUser.uid })
    }
    if (first === 'children' && second && third === 'progress' && method === 'GET') {
      return listDocuments('results', { studentId: second })
    }
    if (first === 'children' && second && third === 'grades' && method === 'GET') {
      return listDocuments('results', { studentId: second })
    }
    if (first === 'children' && second && third === 'attendance' && method === 'GET') {
      return listDocuments('attendance', { studentId: second })
    }
    if (first === 'children' && second && third === 'fees' && method === 'GET') {
      return listDocuments('fees', { studentId: second })
    }
    if (first === 'children' && second && third === 'results' && method === 'GET') {
      return listDocuments('results', { studentId: second })
    }
    if (first === 'children' && second && third === 'homework' && method === 'GET') {
      return listDocuments('homework', { studentId: second, ...queryParams })
    }
    if (first === 'homework' && second && method === 'GET') {
      return getDocumentById('homework', second)
    }
    if (first === 'children' && second && third === 'payments' && method === 'GET') {
      return listDocuments('payments', { studentId: second })
    }
    if (first === 'children' && second && third === 'payment-history' && method === 'GET') {
      return listDocuments('payments', { studentId: second })
    }
    if (second === 'link' && third && method === 'POST') {
      const parentRef = doc(db, 'parents', first)
      await setDoc(parentRef, { students: arrayUnion(third), updatedAt: Timestamp.now() }, { merge: true })
      return { success: true, parentId: first, studentId: third }
    }
    if (second === 'unlink' && third && method === 'POST') {
      const parentRef = doc(db, 'parents', first)
      await setDoc(parentRef, { students: arrayRemove(third), updatedAt: Timestamp.now() }, { merge: true })
      return { success: true, parentId: first, studentId: third }
    }
  }

  // Classroom endpoints
  if (resource === 'classrooms' && method === 'GET') {
    if (segments.length === 1) return listDocuments('classrooms', queryParams)
    if (segments.length === 2) return getDocumentById('classrooms', first)
  }

  // Exam endpoints
  if (resource === 'exams') {
    if (method === 'GET' && segments.length === 1) return listDocuments('exams', queryParams)
    if (method === 'GET' && segments.length === 2) return getDocumentById('exams', first)
    if (method === 'POST') return createDocument('exams', body)
    if (segments.length === 2 && method === 'PUT') return updateDocument('exams', first, body)
    if (segments.length === 2 && method === 'DELETE') return deleteDocument('exams', first)
    if (segments.length === 3 && (second === 'publish' || second === 'close') && method === 'POST') {
      return updateDocument('exams', first, { status: second === 'publish' ? 'published' : 'closed' })
    }
  }

  // Homework endpoints
  if (resource === 'homework') {
    if (segments.length === 1 && method === 'GET') return listDocuments('homework', queryParams)
    if (segments.length === 2 && method === 'GET') return getDocumentById('homework', first)
    if (segments.length === 2 && method === 'PUT') return updateDocument('homework', first, body)
    if (segments.length === 1 && method === 'POST') return createDocument('homework', body)
    if (segments.length === 2 && method === 'DELETE') return deleteDocument('homework', first)
    if (segments.length === 3 && second === 'grade' && method === 'POST') {
      return createDocument('homeworkGrades', { homeworkId: first, ...body })
    }
    if (segments.length === 3 && second === 'submit' && method === 'POST') {
      return updateDocument('homework', first, { status: 'submitted', updatedAt: Timestamp.now() })
    }
  }

  // Results endpoints
  if (resource === 'results') {
    if (segments.length === 1 && method === 'POST') return createDocument('results', body)
    if (segments.length === 1 && method === 'GET') return listDocuments('results', queryParams)
    if (segments.length === 2 && first === 'initialize' && method === 'POST') {
      if (!body?.exam || !body?.classroom) {
        throw new Error('Exam and classroom are required to initialize results')
      }

      const examDoc = await getDocumentById('exams', body.exam)
      const students = await listDocuments('students', { classroom_id: body.classroom })
      const subjectIds = Array.isArray(examDoc.subjects) ? examDoc.subjects : []
      const subjects = await Promise.all(subjectIds.map(async (subjectId) => {
        if (typeof subjectId === 'object') return subjectId
        return getDocumentById('subjects', subjectId)
      }))

      const resultsToCreate = []
      for (const student of students) {
        const studentName = student.name || [student.firstName, student.lastName].filter(Boolean).join(' ') || student.studentId || student._id
        const studentId = student.studentId || student.uid || student._id

        if (subjects.length === 0) {
          resultsToCreate.push({
            examId: examDoc._id,
            classroomId: body.classroom,
            studentId,
            student: { _id: student._id, name: studentName, studentId },
            exam: {
              _id: examDoc._id,
              name: examDoc.name,
              term: examDoc.term,
              academicYear: examDoc.academicYear,
              totalMarks: examDoc.totalMarks || 100,
            },
            score: null,
            maxMarks: examDoc.totalMarks || 100,
            status: 'draft',
            remarks: '',
          })
        } else {
          for (const subject of subjects) {
            const normalizedSubject = typeof subject === 'object' ? subject : { _id: subject, name: '', code: '' }
            resultsToCreate.push({
              examId: examDoc._id,
              classroomId: body.classroom,
              studentId,
              student: { _id: student._id, name: studentName, studentId },
              exam: {
                _id: examDoc._id,
                name: examDoc.name,
                term: examDoc.term,
                academicYear: examDoc.academicYear,
                totalMarks: examDoc.totalMarks || 100,
              },
              subject: {
                _id: normalizedSubject._id || normalizedSubject.id,
                name: normalizedSubject.name || normalizedSubject.title || '',
                code: normalizedSubject.code || '',
              },
              score: null,
              maxMarks: examDoc.totalMarks || 100,
              status: 'draft',
              remarks: '',
            })
          }
        }
      }

      const createdResults = []
      for (const item of resultsToCreate) {
        createdResults.push(await createDocument('results', item))
      }
      return createdResults
    }
    if (segments.length === 2) {
      if (method === 'GET') return getDocumentById('results', first)
      if (method === 'PUT') return updateDocument('results', first, body)
      if (method === 'DELETE') return deleteDocument('results', first)
    }
    if (segments.length === 3 && first === 'classroom' && method === 'GET') {
      return listDocuments('results', { classroomId: second, examId: queryParams.examId })
    }
    if (segments.length === 3 && first === 'student' && method === 'GET') {
      return listDocuments('results', { studentId: second, ...queryParams })
    }
    if (segments.length === 5 && first === 'classroom' && third === 'exam' && method === 'GET') {
      return listDocuments('results', { classroomId: second, examId: fourth })
    }
    if (segments.length === 2 && ['submit', 'approve', 'publish'].includes(second) && method === 'POST') {
      return updateDocument('results', first, { status: second, updatedAt: Timestamp.now() })
    }
    if (segments.length === 3 && second === 'bulk' && ['submit', 'approve', 'publish'].includes(third) && method === 'POST') {
      const resultIds = body?.resultIds || []
      const promises = resultIds.map((id) => updateDocument('results', id, { status: third, updatedAt: Timestamp.now() }))
      return Promise.all(promises)
    }
    if (segments.length === 4 && second === 'exam' && third === 'statistics' && method === 'GET') {
      const results = await listDocuments('results', { examId: first, ...queryParams })
      const average = results.reduce((sum, item) => sum + (item.score || 0), 0) / Math.max(results.length, 1)
      return { average, count: results.length }
    }
    if (segments.length === 2 && first === 'pending' && method === 'GET') {
      return listDocuments('results', { status: 'pending', ...queryParams })
    }
  }

  // Messages endpoints
  if (resource === 'messages') {
    const getCurrentUserSummary = async () => {
      const profile = await getCurrentUserProfile()
      return normalizeUserSummary(profile)
    }

    const getUserById = async (id) => {
      if (!id) return normalizeUserSummary({})
      return getDocumentById('users', id)
        .then(normalizeUserSummary)
        .catch(() => normalizeUserSummary({ _id: id }))
    }

    const listNormalizedMessages = async () => {
      const messages = await listDocuments('messages')
      return messages
        .map(normalizeMessage)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    }

    if (first === 'inbox' && method === 'GET') {
      const currentUser = await getCurrentUserSummary()
      const messages = await listNormalizedMessages()
      return {
        messages: messages.filter((message) => {
          const recipientId = String(message.recipientId || message.recipient?.id || message.recipient?._id || '')
          return recipientId === String(currentUser.id)
        }),
      }
    }

    if (first === 'sent' && method === 'GET') {
      const currentUser = await getCurrentUserSummary()
      const messages = await listNormalizedMessages()
      return {
        messages: messages.filter((message) => {
          const senderId = String(message.senderId || message.sender?.id || message.sender?._id || '')
          return senderId === String(currentUser.id)
        }),
      }
    }

    if (first === 'unread' && second === 'count' && method === 'GET') {
      const currentUser = await getCurrentUserSummary()
      const messages = await listNormalizedMessages()
      const unreadCount = messages.filter((message) => {
        const recipientId = String(message.recipientId || message.recipient?.id || message.recipient?._id || '')
        return recipientId === String(currentUser.id) && !message.isRead
      }).length
      return { unreadCount }
    }

    if (first === 'conversation' && second && method === 'GET') {
      const currentUser = await getCurrentUserSummary()
      const otherUserId = String(second)
      const messages = await listNormalizedMessages()
      return {
        messages: messages.filter((message) => {
          const senderId = String(message.senderId || message.sender?.id || message.sender?._id || '')
          const recipientId = String(message.recipientId || message.recipient?.id || message.recipient?._id || '')
          return (
            (senderId === String(currentUser.id) && recipientId === otherUserId) ||
            (senderId === otherUserId && recipientId === String(currentUser.id))
          )
        }),
      }
    }

    if (first === 'send' && method === 'POST') {
      const currentUser = await getCurrentUserSummary()
      const recipient = await getUserById(body?.recipientId)
      const message = await createDocument('messages', {
        senderId: currentUser.id,
        recipientId: recipient.id,
        sender: currentUser,
        recipient,
        subject: body?.subject || 'Chat',
        message: body?.message || '',
        priority: body?.priority || 'normal',
        category: body?.category || 'general',
        isRead: false,
      })
      return { message: normalizeMessage(message), success: true }
    }

    if (first === 'contacts' && second === 'list' && method === 'GET') {
      const currentUser = await getCurrentUserSummary()
      const users = await listDocuments('users')
      return {
        contacts: users
          .map(normalizeUserSummary)
          .filter((contact) => String(contact.id) !== String(currentUser.id)),
      }
    }

    if (second === 'read' && method === 'PATCH') {
      const message = await updateDocument('messages', first, { isRead: true, readAt: Timestamp.now() })
      return { message: normalizeMessage(message), success: true }
    }

    if (first === 'search' && second && method === 'GET') {
      const currentUser = await getCurrentUserSummary()
      const messages = await listNormalizedMessages()
      const searchTerm = String(second).toLowerCase()
      return {
        messages: messages.filter((message) => {
          const senderId = String(message.senderId || message.sender?.id || message.sender?._id || '')
          const recipientId = String(message.recipientId || message.recipient?.id || message.recipient?._id || '')
          const isParticipant = senderId === String(currentUser.id) || recipientId === String(currentUser.id)
          return isParticipant && String(message.message || '').toLowerCase().includes(searchTerm)
        }),
      }
    }

    if (first && method === 'DELETE') {
      return deleteDocument('messages', first)
    }
  }

  // Report option endpoints used by report screens in Firestore-backed local dev.
  if (resource === 'reports') {
    if (first === 'available' && method === 'GET') {
      const [students, classrooms, subjects] = await Promise.all([
        listDocuments('students'),
        listDocuments('classrooms'),
        listDocuments('subjects'),
      ])

      return {
        parameters: {
          students: students.map((student) => ({
            id: student._id,
            name: [student.firstName, student.lastName].filter(Boolean).join(' ') || student.name || student.email || student._id,
          })),
          classes: classrooms.map((classroom) => ({
            id: classroom._id,
            name: classroom.className || classroom.name || classroom._id,
          })),
          subjects: subjects.map((subject) => ({
            id: subject._id,
            name: subject.name || subject.subjectName || subject._id,
          })),
          reportTypes: ['attendance', 'grades', 'fees', 'analytics'],
        },
      }
    }

    if (first === 'terms' && second === 'available' && method === 'GET') {
      const results = await listDocuments('results', { studentId: queryParams.studentId })
      const terms = Array.from(
        new Map(
          results
            .filter((result) => result.term && result.academicYear)
            .map((result) => [`${result.term}-${result.academicYear}`, {
              term: result.term,
              academicYear: result.academicYear,
            }])
        ).values()
      )

      return { terms }
    }
  }

  // Messages, roles, receipts and other custom endpoints will still fall through to Firestore helper or error.

  throw new Error(`Unsupported Firestore endpoint: ${endpoint}`)
}

const parseRequestBody = (body) => {
  if (!body) return undefined
  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch {
      return body
    }
  }
  return body
}

const normalizeDateValue = (value) => {
  if (!value) return new Date().toISOString()
  if (typeof value.toDate === 'function') return value.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  return value
}

const normalizeUserSummary = (user) => ({
  id: user?._id || user?.id || user?.uid || '',
  _id: user?._id || user?.id || user?.uid || '',
  name: user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'User',
  email: user?.email || '',
  role: user?.role || '',
})

const normalizeMessage = (message) => ({
  ...message,
  sender: normalizeUserSummary(message.sender || { _id: message.senderId, name: message.senderName }),
  recipient: normalizeUserSummary(message.recipient || { _id: message.recipientId, name: message.recipientName }),
  createdAt: normalizeDateValue(message.createdAt),
  updatedAt: normalizeDateValue(message.updatedAt || message.createdAt),
})

export const apiCall = async (endpoint, options = {}) => {
  const body = parseRequestBody(options.body)

  const [path, queryString] = endpoint.split('?')
  const queryParams = {
    ...Object.fromEntries(new URLSearchParams(queryString || '')),
    ...options.queryParams,
  }

  if (USE_FIRESTORE) {
    try {
      return await firestoreRequest(options.method || 'GET', path, body, queryParams)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Firestore request failed')
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` }
      }
      if (response.status === 401) {
        if (endpoint === '/auth/login') {
          throw new Error(errorData.message || errorData.error || 'Invalid credentials')
        }
        notifyUnauthorized()
        throw new Error('Session expired. Please login again.')
      }
      throw new Error(errorData.error || errorData.message || 'Request failed')
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text()
      return text ? JSON.parse(text) : {}
    }

    return {}
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error. Please check your connection.')
  }
}

export const authApi = {
  login: async (email, password) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = credential.user
      const profile = await getCurrentUserProfile()
      const token = await firebaseUser.getIdToken()
      return {
        user_id: firebaseUser.uid,
        token,
        email: firebaseUser.email,
        role: profile.role,
        name: profile.name || firebaseUser.displayName || 'User',
      }
    } catch (error) {
      throw new Error(error?.message || 'Login failed')
    }
  },

  logout: async () => {
    await firebaseSignOut(auth)
    return { success: true }
  },

  me: async () => {
    return getCurrentUserProfile()
  },
}

// Students API
export const studentsApi = {
  list: async () => {
    return apiCall('/students');
  },

  get: async (student_id) => {
    return apiCall(`/students/${student_id}`);
  },

  create: async (data) => {
    return apiCall('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (student_id, data) => {
    return apiCall(`/students/${student_id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (student_id) => {
    return apiCall(`/students/${student_id}`, {
      method: 'DELETE',
    });
  },
};

// Teachers API
export const teachersApi = {
  list: async () => {
    return apiCall('/teachers');
  },

  get: async (teacher_id) => {
    return apiCall(`/teachers/${teacher_id}`);
  },

  create: async (data) => {
    return apiCall('/teachers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (teacher_id, data) => {
    return apiCall(`/teachers/${teacher_id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (teacher_id) => {
    return apiCall(`/teachers/${teacher_id}`, {
      method: 'DELETE',
    });
  },
};

// Classrooms API
export const classroomsApi = {
  list: async () => {
    return apiCall('/classrooms');
  },

  get: async (id) => {
    return apiCall(`/classrooms/${id}`);
  },

  create: async (data) => {
    return apiCall('/classrooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    if (!id) throw new Error('Classroom id is required');
    return apiCall(`/classrooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (classroom_id) => {
    return apiCall(`/classrooms/${classroom_id}`, {
      method: 'DELETE',
    });
  },
};

// Subjects API
export const subjectsApi = {
  list: async () => {
    return apiCall('/subjects');
  },

  get: async (subject_id) => {
    return apiCall(`/subjects/${subject_id}`);
  },

  create: async (data) => {
    return apiCall('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (subject_id, data) => {
    return apiCall(`/subjects/${subject_id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (subject_id) => {
    return apiCall(`/subjects/${subject_id}`, {
      method: 'DELETE',
    });
  },
};

// Timetable API - NOTE: Backend endpoints not yet implemented
// Timetable Schedule API - Comprehensive timetable management
export const timetableApi = {
  // Timetable Schedules
  schedules: {
    list: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiCall(`/timetable/schedules${query ? `?${query}` : ''}`);
    },

    get: async (id) => {
      return apiCall(`/timetable/schedules/${id}`);
    },

    getByClassroom: async (classroom_id, params = {}) => {
      const query = new URLSearchParams(params).toString();
      const data = await apiCall(`/timetable/schedules/classroom/${classroom_id}${query ? `?${query}` : ''}`);
      return Array.isArray(data) ? data[0] || null : data;
    },

    getByInstructor: async (instructor_id, params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiCall(`/timetable/schedules/instructor/${instructor_id}${query ? `?${query}` : ''}`);
    },

    create: async (data) => {
      return apiCall('/timetable/schedules', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id, data) => {
      return apiCall(`/timetable/schedules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id) => {
      return apiCall(`/timetable/schedules/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Instructors
  instructors: {
    list: async () => {
      return apiCall('/timetable/instructors');
    },

    get: async (id) => {
      return apiCall(`/timetable/instructors/${id}`);
    },

    getByStaff: async (staff_id) => {
      return apiCall(`/timetable/instructors/staff/${staff_id}`);
    },

    create: async (data) => {
      return apiCall('/timetable/instructors', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id, data) => {
      return apiCall(`/timetable/instructors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id) => {
      return apiCall(`/timetable/instructors/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Courses
  courses: {
    list: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiCall(`/timetable/courses${query ? `?${query}` : ''}`);
    },

    get: async (id) => {
      return apiCall(`/timetable/courses/${id}`);
    },

    getByClassroom: async (classroom_id, params = {}) => {
      const query = new URLSearchParams(params).toString();
      const data = await apiCall(`/timetable/courses/classroom/${classroom_id}${query ? `?${query}` : ''}`);
      return Array.isArray(data) ? data[0] || null : data;
    },

    create: async (data) => {
      return apiCall('/timetable/courses', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id, data) => {
      return apiCall(`/timetable/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id) => {
      return apiCall(`/timetable/courses/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Legacy compatibility methods
  list: async () => {
    return apiCall('/timetable/schedules');
  },

  getByClassroom: async (classroom_id) => {
    const data = await apiCall(`/timetable/schedules/classroom/${classroom_id}`);
    return Array.isArray(data) ? data[0] || null : data;
  },

  create: async (data) => {
    return apiCall('/timetable/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (timetable_id, data) => {
    return apiCall(`/timetable/schedules/${timetable_id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (timetable_id) => {
    return apiCall(`/timetable/schedules/${timetable_id}`, {
      method: 'DELETE',
    });
  },
};

// Attendance API
export const attendanceApi = {
  list: async () => {
    return apiCall('/attendance');
  },

  getByUser: async (user_id) => {
    return apiCall(`/attendance/${user_id}`);
  },

  getByClassroom: async (classroomId) => {
    return apiCall(`/teacher/classroom/${classroomId}/attendance`);
  },

  mark: async (data) => {
    return apiCall('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (attendance_id, data) => {
    return apiCall(`/attendance/record/${attendance_id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (attendance_id) => {
    return apiCall(`/attendance/record/${attendance_id}`, {
      method: 'DELETE',
    });
  },
};

// Fees API
export const feesApi = {
  list: async () => {
    return apiCall('/fees');
  },

  listByFilters: async (queryParams) => {
    const queryString = queryParams.toString();
    return apiCall(`/accounts/fees${queryString ? '?' + queryString : ''}`);
  },

  get: async (fee_id) => {
    return apiCall(`/fees/${fee_id}`);
  },

  create: async (data) => {
    return apiCall('/accounts/fees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (fee_id, data) => {
    return apiCall(`/fees/${fee_id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (fee_id) => {
    return apiCall(`/fees/${fee_id}`, {
      method: 'DELETE',
    });
  },
};

// Payments API
export const paymentsApi = {
  list: async () => {
    return apiCall('/payments');
  },

  create: async (data) => {
    return apiCall('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Expenses API
export const expensesApi = {
  list: async () => {
    return apiCall('/expenses');
  },

  get: async (expense_id) => {
    return apiCall(`/expenses/${expense_id}`);
  },

  create: async (data) => {
    return apiCall('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (expense_id, data) => {
    return apiCall(`/expenses/${expense_id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (expense_id) => {
    return apiCall(`/expenses/${expense_id}`, {
      method: 'DELETE',
    });
  },
};

// Issues API - NOTE: Backend endpoints not yet implemented
export const issuesApi = {
  list: async () => {
    return apiCall('/issues');
  },

  get: async (issue_id) => {
    return apiCall(`/issues/${issue_id}`);
  },

  create: async (data) => {
    return apiCall('/issues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (issue_id, data) => {
    return apiCall(`/issues/${issue_id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  resolve: async (issue_id) => {
    return apiCall(`/issues/${issue_id}/resolve`, {
      method: 'PUT',
    });
  },

  delete: async (issue_id) => {
    return apiCall(`/issues/${issue_id}`, {
      method: 'DELETE',
    });
  },
};

// Settings API
export const settingsApi = {
  getSchoolSettings: async () => {
    return apiCall('/settings', {
      method: 'GET',
    });
  },

  updateSchoolSettings: async (data) => {
    return apiCall('/settings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Academic Years
  getAllAcademicYears: async () => {
    const result = await apiCall('/settings/academic-years', {
      method: 'GET',
    });
    return Array.isArray(result)
      ? { academicYears: result, currentYear: null }
      : result;
  },

  createAcademicYear: async (data) => {
    const createdYear = await apiCall('/settings/academic-years', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (data?.isCurrent && createdYear?._id) {
      await settingsApi.setCurrentAcademicYear(createdYear._id);
    }

    return createdYear;
  },

  updateAcademicYear: async (year_id, data) => {
    return apiCall(`/settings/academic-years/${year_id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  setCurrentAcademicYear: async (year_id) => {
    return apiCall(`/settings/academic-years/${year_id}/set-current`, {
      method: 'POST',
      body: JSON.stringify({ year_id }),
    });
  },

  deleteAcademicYear: async (year_id) => {
    return apiCall(`/settings/academic-years/${year_id}`, {
      method: 'DELETE',
    });
  },

  // Fee Structures
  getAllFeeStructures: async () => {
    return apiCall('/settings/fee-structures', {
      method: 'GET',
    });
  },

  createFeeStructure: async (data) => {
    return apiCall('/settings/fee-structures', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateFeeStructure: async (fee_id, data) => {
    return apiCall(`/settings/fee-structures/${fee_id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteFeeStructure: async (fee_id) => {
    return apiCall(`/settings/fee-structures/${fee_id}`, {
      method: 'DELETE',
    });
  },

  // Holidays
  getAllHolidays: async () => {
    return apiCall('/settings/holidays', {
      method: 'GET',
    });
  },

  createHoliday: async (data) => {
    return apiCall('/settings/holidays', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteHoliday: async (holiday_id) => {
    return apiCall(`/settings/holidays/${holiday_id}`, {
      method: 'DELETE',
    });
  },
};

// ============= ROLE-BASED APIs =============

// Admin API
export const adminApi = {
  getDashboard: async () => {
    return apiCall('/admin/dashboard', {
      method: 'GET',
    });
  },

  getUserManagement: async () => {
    return apiCall('/admin/users', {
      method: 'GET',
    });
  },

  getReports: async () => {
    return apiCall('/admin/reports', {
      method: 'GET',
    });
  },

  getAuditLogs: async () => {
    return apiCall('/admin/audit-logs', {
      method: 'GET',
    });
  },

  search: async (query) => {
    const params = new URLSearchParams({ q: query });
    return apiCall(`/admin/search?${params.toString()}`, {
      method: 'GET',
    });
  },

  // Staff and Students raw lists (include _id)
  listStaff: async (params = {}) => {
    const query = new URLSearchParams({ limit: '1000', ...params }).toString();
    return apiCall(`/admin/staff-list?${query}`, { method: 'GET' });
  },

  listStudents: async (params = {}) => {
    const query = new URLSearchParams({ limit: '1000', ...params }).toString();
    return apiCall(`/admin/students-list?${query}`, { method: 'GET' });
  },
};

// Accounts API
export const accountsApi = {
  list: async () => {
    // Return accounts users from the admin users collection using role filtering
    return apiCall(`/admin/users?role=${ROLES.ACCOUNTS}`);
  },

  getDashboard: async () => {
    return apiCall('/accounts/dashboard', {
      method: 'GET',
    });
  },

  getFees: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/accounts/fees?${params}`, {
      method: 'GET',
    });
  },

  createFee: async (data) => {
    return apiCall('/accounts/fees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateFee: async (fee_id, data) => {
    return apiCall(`/accounts/fees/${fee_id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteFee: async (fee_id) => {
    return apiCall(`/accounts/fees/${fee_id}`, {
      method: 'DELETE',
    });
  },

  getPayments: async (filters = {}) => {
    const params = filters instanceof URLSearchParams ? filters : new URLSearchParams(filters);
    const result = await apiCall(`/accounts/payments?${params}`, {
      method: 'GET',
    });

    if (Array.isArray(result)) {
      return {
        payments: result,
        summary: {},
        pagination: {
          total: result.length,
          pages: 1,
          page: Number(params.get('page')) || 1,
          limit: Number(params.get('limit')) || result.length,
        },
      };
    }

    return result;
  },

  createPayment: async (data) => {
    return apiCall('/accounts/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getExpenses: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/accounts/expenses?${params}`, {
      method: 'GET',
    });
  },

  createExpense: async (data) => {
    return apiCall('/accounts/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateExpense: async (expense_id, data) => {
    return apiCall(`/accounts/expenses/${expense_id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteExpense: async (expense_id) => {
    return apiCall(`/accounts/expenses/${expense_id}`, {
      method: 'DELETE',
    });
  },

  // Financial Reports
  getReportSummary: async (filters = {}) => {
    const params = filters instanceof URLSearchParams ? filters : new URLSearchParams(filters);
    return apiCall(`/accounts/reports/summary?${params}`, {
      method: 'GET',
    });
  },

  getReportOverdue: async () => {
    return apiCall('/accounts/reports/overdue', {
      method: 'GET',
    });
  },

  getReportTrend: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/accounts/reports/collection-trend?${params}`, {
      method: 'GET',
    });
  },

  getReports: async () => {
    return apiCall('/accounts/reports', {
      method: 'GET',
    });
  },

  exportReport: async (type, format = 'pdf') => {
    return apiCall(`/accounts/reports/export?type=${type}&format=${format}`, {
      method: 'GET',
    });
  },
};

// Teacher API
export const teacherApi = {
  getDashboard: async () => {
    return apiCall('/teacher/dashboard', {
      method: 'GET',
    });
  },

  getMyClasses: async () => {
    return apiCall('/teacher/classes', {
      method: 'GET',
    });
  },

  getMyStudents: async () => {
    return apiCall('/teacher/students', {
      method: 'GET',
    });
  },

  getMyClassrooms: async () => {
    return apiCall('/teacher/classrooms', {
      method: 'GET',
    });
  },

  getClassroomStudents: async (classroomId) => {
    return apiCall(`/teacher/classroom/${classroomId}/students`, {
      method: 'GET',
    });
  },

  getMySubjects: async () => {
    return apiCall('/teacher/subjects', {
      method: 'GET',
    });
  },

  getAttendanceRecords: async () => {
    return apiCall('/teacher/attendance', {
      method: 'GET',
    });
  },

  markAttendance: async (data) => {
    return apiCall('/teacher/attendance/mark', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getGrades: async () => {
    return apiCall('/teacher/grades', {
      method: 'GET',
    });
  },

  submitGrades: async (data) => {
    return apiCall('/teacher/grades', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPerformanceStats: async () => {
    return apiCall('/teacher/performance', {
      method: 'GET',
    });
  },
};

// Student API
export const studentApi = {
  getDashboard: async () => {
    return apiCall('/student/dashboard', {
      method: 'GET',
    });
  },

  getMyProfile: async () => {
    return apiCall('/student/profile', {
      method: 'GET',
    });
  },

  updateProfile: async (data) => {
    return apiCall('/student/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getMyGrades: async () => {
    return apiCall('/student/grades', {
      method: 'GET',
    });
  },

  getMyAttendance: async () => {
    return apiCall('/student/attendance', {
      method: 'GET',
    });
  },

  getMyFees: async () => {
    return apiCall('/student/fees', {
      method: 'GET',
    });
  },

  getMySubjects: async () => {
    return apiCall('/student/subjects', {
      method: 'GET',
    });
  },

  getExamSchedule: async () => {
    return apiCall('/student/exams', {
      method: 'GET',
    });
  },

  getTimeTable: async () => {
    return apiCall('/student/timetable', {
      method: 'GET',
    });
  },
};

// Head Teacher API
export const headTeacherApi = {
  getDashboard: async () => {
    return apiCall('/head-teacher/dashboard', {
      method: 'GET',
    });
  },

  getStudents: async () => {
    return apiCall('/head-teacher/students', {
      method: 'GET',
    });
  },

  getSubjects: async () => {
    return apiCall('/head-teacher/subjects', {
      method: 'GET',
    });
  },

  getStaffList: async () => {
    return apiCall('/head-teacher/staff', {
      method: 'GET',
    });
  },

  getAttendanceAnalytics: async () => {
    return apiCall('/head-teacher/attendance-analytics', {
      method: 'GET',
    });
  },

  getPerformanceMetrics: async () => {
    return apiCall('/head-teacher/performance', {
      method: 'GET',
    });
  },
};

// Parents API
export const parentsApi = {
  list: async () => {
    return apiCall('/parents');
  },

  getDashboard: async () => {
    return apiCall('/parents/dashboard', {
      method: 'GET',
    });
  },

  getMyChildren: async () => {
    return apiCall('/parents/children', {
      method: 'GET',
    });
  },

  getChildProgress: async (student_id) => {
    return apiCall(`/parents/children/${student_id}/progress`, {
      method: 'GET',
    });
  },

  getChildGrades: async (student_id) => {
    return apiCall(`/parents/children/${student_id}/grades`, {
      method: 'GET',
    });
  },

  getChildAttendance: async (student_id) => {
    return apiCall(`/parents/children/${student_id}/attendance`, {
      method: 'GET',
    });
  },

  getChildFees: async (student_id) => {
    return apiCall(`/parents/children/${student_id}/fees`, {
      method: 'GET',
    });
  },

  getChildResults: async (student_id) => {
    return apiCall(`/parents/children/${student_id}/results`, {
      method: 'GET',
    });
  },

  getChildHomework: async (student_id, academicYear) => {
    const query = new URLSearchParams();
    if (academicYear) query.append('academicYear', academicYear);
    return apiCall(`/parents/children/${student_id}/homework${query.toString() ? '?' + query.toString() : ''}`, {
      method: 'GET',
    });
  },

  getHomeworkDetails: async (homework_id) => {
    return apiCall(`/parents/homework/${homework_id}`, {
      method: 'GET',
    });
  },

  downloadHomeworkAttachment: async (homework_id, attachment_id) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/homework/${homework_id}/attachment/${attachment_id}/download`, {
      method: 'GET',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to download attachment');
    }
    return await response.blob();
  },

  downloadChildReport: async (student_id) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/parents/children/${student_id}/report`, {
      method: 'GET',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to download report');
    }
    return await response.blob();
  },

  makePayment: async (student_id, paymentData) => {
    // paymentData: { fee_id?, amount, paymentMethod, notes? }
    return apiCall(`/parents/children/${student_id}/payments`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  getPaymentHistory: async (student_id) => {
    return apiCall(`/parents/children/${student_id}/payment-history`, {
      method: 'GET',
    });
  },

  createPayment: async (data) => {
    return apiCall('/parents/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPaymentHistory: async () => {
    return apiCall('/parents/payments', {
      method: 'GET',
    });
  },

  update: async (parentId, data) => {
    return apiCall(`/parents/${parentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (parentId) => {
    return apiCall(`/parents/${parentId}`, {
      method: 'DELETE',
    });
  },

  linkStudent: async (parentId, studentId) => {
    return apiCall(`/parents/${parentId}/link/${studentId}`, {
      method: 'POST',
    });
  },

  unlinkStudent: async (parentId, studentId) => {
    return apiCall(`/parents/${parentId}/unlink/${studentId}`, {
      method: 'POST',
    });
  },
};

// Classroom API
export const classroomApi = {
  list: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/classrooms${query ? '?' + query : ''}`)
  },

  getById: async (id) => {
    return apiCall(`/classrooms/${id}`)
  },

  create: async (data) => {
    return apiCall('/classrooms', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id, data) => {
    return apiCall(`/classrooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id) => {
    return apiCall(`/classrooms/${id}`, {
      method: 'DELETE',
    })
  }
}

// Exams API
export const examApi = {
  list: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/exams${query ? '?' + query : ''}`)
  },

  getById: async (id) => {
    return apiCall(`/exams/${id}`)
  },

  create: async (data) => {
    return apiCall('/exams', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id, data) => {
    return apiCall(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id) => {
    return apiCall(`/exams/${id}`, {
      method: 'DELETE',
    })
  },

  publish: async (id) => {
    return apiCall(`/exams/${id}/publish`, {
      method: 'POST',
    })
  },

  close: async (id) => {
    return apiCall(`/exams/${id}/close`, {
      method: 'POST',
    })
  }
}

// Homework API
export const homeworkApi = {
  getByClassroom: async (classroomId, academicYear) => {
    const query = new URLSearchParams();
    if (academicYear) query.append('academicYear', academicYear);
    return apiCall(`/homework/classroom/${classroomId}${query.toString() ? '?' + query.toString() : ''}`)
  },

  getById: async (id) => {
    return apiCall(`/homework/${id}`)
  },

  create: async (data) => {
    return apiCall('/homework', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id, data) => {
    return apiCall(`/homework/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  addFiles: async (id, formData) => {
    const token = getToken()
    const response = await fetch(`${API_BASE_URL}/homework/${id}/add-files`, {
      method: 'PUT',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to add files')
    }

    return await response.json()
  },

  delete: async (id) => {
    return apiCall(`/homework/${id}`, {
      method: 'DELETE',
    })
  },

  submit: async (id) => {
    return apiCall(`/homework/${id}/submit`, {
      method: 'POST',
    })
  },

  submitWithFiles: async (id, formData) => {
    const token = getToken()
    const response = await fetch(`${API_BASE_URL}/homework/${id}/submit`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to submit homework')
    }

    return await response.json()
  },

  createWithFiles: async (formData) => {
    const token = getToken()
    const response = await fetch(`${API_BASE_URL}/homework/create-with-files`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create homework')
    }

    return await response.json()
  },

  grade: async (id, studentId, grade, feedback) => {
    return apiCall(`/homework/${id}/grade`, {
      method: 'POST',
      body: JSON.stringify({ studentId, grade, feedback }),
    })
  },

  downloadAttachment: async (homeworkId, attachmentId) => {
    const token = getToken()
    const response = await fetch(`${API_BASE_URL}/homework/${homeworkId}/attachment/${attachmentId}/download`, {
      method: 'GET',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to download attachment')
    }
    return await response.blob()
  },

  downloadSubmissionAttachment: async (homeworkId, studentId, attachmentId) => {
    const token = getToken()
    const response = await fetch(`${API_BASE_URL}/homework/${homeworkId}/submission/${studentId}/attachment/${attachmentId}/download`, {
      method: 'GET',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to download submission attachment')
    }
    return await response.blob()
  }
}
// ============= NEW EXAM & RESULTS API =============


// Results API
export const resultApi = {
  // Entry operations
  create: async (data) => {
    return apiCall('/results', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  createBatch: async (exam, classroom, subject, results, maxMarks = 100) => {
    return apiCall('/results/batch', {
      method: 'POST',
      body: JSON.stringify({
        exam,
        classroom,
        subject,
        results,
        maxMarks
      }),
    })
  },

  initializeResults: async (data) => {
    return apiCall('/results/initialize', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getClassroomExamResults: async (classroomId, examId) => {
    return apiCall(`/results/classroom/${classroomId}/exam/${examId}`)
  },

  update: async (id, data) => {
    return apiCall(`/results/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id) => {
    return apiCall(`/results/${id}`, {
      method: 'DELETE',
    })
  },

  submit: async (id) => {
    return apiCall(`/results/${id}/submit`, {
      method: 'POST',
    })
  },

  // Approval operations
  getPending: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString()
    return apiCall(`/results/pending${query ? '?' + query : ''}`)
  },

  approve: async (id) => {
    return apiCall(`/results/${id}/approve`, {
      method: 'POST',
    })
  },

  publish: async (id) => {
    return apiCall(`/results/${id}/publish`, {
      method: 'POST',
    })
  },

  reject: async (id, reason = '') => {
    return apiCall(`/results/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  },

  // Viewing operations
  getByStudent: async (studentId, filters = {}) => {
    const query = new URLSearchParams(filters).toString()
    return apiCall(`/results/student/${studentId}${query ? '?' + query : ''}`)
  },

  getExamStatistics: async (examId, filters = {}) => {
    const query = new URLSearchParams(filters).toString()
    return apiCall(`/results/exam/${examId}/statistics${query ? '?' + query : ''}`)
  },

  // Bulk operations
  bulkSubmit: async (resultIds) => {
    return apiCall('/results/bulk/submit', {
      method: 'POST',
      body: JSON.stringify({ resultIds }),
    })
  },

  bulkApprove: async (resultIds) => {
    return apiCall('/results/bulk/approve', {
      method: 'POST',
      body: JSON.stringify({ resultIds }),
    })
  },

  bulkPublish: async (resultIds) => {
    return apiCall('/results/bulk/publish', {
      method: 'POST',
      body: JSON.stringify({ resultIds }),
    })
  }
}
