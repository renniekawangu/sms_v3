import fs from 'fs'
import path from 'path'
import admin from 'firebase-admin'

const ROOT = process.cwd()
const serviceAccountPath = path.join(ROOT, 'serviceAccountKey.json')

if (!fs.existsSync(serviceAccountPath)) {
  console.error('Missing serviceAccountKey.json in project root.')
  process.exit(1)
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))

process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountPath
process.env.GCLOUD_PROJECT = serviceAccount.project_id || process.env.GCLOUD_PROJECT || ''

const credential = admin.credential.cert(serviceAccount)
admin.initializeApp({
  credential,
  projectId: serviceAccount.project_id,
})

const db = admin.firestore()
const auth = admin.auth()
const { Timestamp } = admin.firestore
const SEED_PASSWORD = 'Password123!'

const validateFirebaseCredentials = async () => {
  console.log('Validating Firebase Admin credentials...')
  const token = await credential.getAccessToken()
  if (!token || !token.access_token) {
    throw new Error('Failed to obtain a Firebase access token with the current service account.')
  }
  console.log('Firebase Admin credentials validated.')
}

const roles = [
  {
    _id: 'admin',
    role_id: 1,
    name: 'Admin',
    description: 'Full system access',
    permissions: [
      'user:create',
      'user:update',
      'user:delete',
      'role:assign',
      'school:configure',
      'class:manage',
      'subject:manage',
      'term:manage',
      'academic_year:manage',
      'report:academic:view',
      'report:financial:view',
      'audit_log:view',
      'system:settings:update',
    ],
    created_at: '2024-01-01',
  },
  {
    _id: 'teacher',
    role_id: 2,
    name: 'Teacher',
    description: 'Manage classrooms, attendance, and homework',
    permissions: [
      'student:attendance:mark',
      'student:results:create',
      'student:results:update',
      'homework:create',
      'homework:view',
      'parent:message',
    ],
    created_at: '2024-01-01',
  },
  {
    _id: 'accounts',
    role_id: 3,
    name: 'Accounts',
    description: 'Manage fees, payments, and expenses',
    permissions: [
      'fees:structure:create',
      'fees:structure:update',
      'payment:record',
      'payment:view',
      'student:balance:view',
      'report:financial:generate',
      'finance:export',
    ],
    created_at: '2024-01-01',
  },
  {
    _id: 'head-teacher',
    role_id: 4,
    name: 'Head Teacher',
    description: 'Oversee teaching, approval workflows and academic reporting',
    permissions: [
      'teacher:attendance:view',
      'teacher:attendance:mark',
      'student:attendance:view',
      'student:results:view',
      'student:results:approve',
      'report:academic:generate',
      'announcement:create',
    ],
    created_at: '2024-01-01',
  },
  {
    _id: 'parent',
    role_id: 5,
    name: 'Parent',
    description: 'View child progress and reports',
    permissions: [
      'student:results:view:self',
      'student:attendance:view:self',
      'fees:balance:view:self',
      'announcement:view',
      'teacher:message',
    ],
    created_at: '2024-01-01',
  },
  {
    _id: 'student',
    role_id: 5,
    name: 'Student',
    description: 'View personal attendance and results',
    permissions: [
      'student:results:view:self',
      'student:attendance:view:self',
    ],
    created_at: '2024-01-01',
  },
]

const users = [
  {
    name: 'Admin User',
    email: 'admin@esyncsms.com',
    role: 'admin',
    phone: '+10000000001',
    date_of_join: '2024-01-01',
  },
  {
    name: 'Lead Teacher',
    email: 'teacher1@esyncsms.com',
    role: 'teacher',
    phone: '+10000000002',
    date_of_join: '2024-01-05',
  },
  {
    name: 'Accounts Officer',
    email: 'accounts@esyncsms.com',
    role: 'accounts',
    phone: '+10000000003',
    date_of_join: '2024-01-08',
  },
  {
    name: 'Head Teacher',
    email: 'headteacher@esyncsms.com',
    role: 'head-teacher',
    phone: '+10000000006',
    date_of_join: '2024-01-07',
  },
  {
    name: 'Parent Guardian',
    email: 'parent1@esyncsms.com',
    role: 'parent',
    phone: '+10000000004',
    relationship: 'Mother',
    occupation: 'Teacher',
  },
  {
    name: 'Student One',
    email: 'student1@esyncsms.com',
    role: 'student',
    phone: '+10000000005',
    dob: '2012-06-15',
    sex: 'Female',
    address: '123 Main Street',
    date_of_join: '2024-01-10',
  },
]

const seedStudentProfiles = [
  {
    userEmail: 'student1@esyncsms.com',
    student_id: 'STU1001',
    classroom: 'Grade 5A',
    parentId: 'parent1',
  },
]

const seedParentProfiles = [
  {
    userEmail: 'parent1@esyncsms.com',
    relationship: 'Mother',
    occupation: 'Teacher',
    students: ['student1'],
  },
]

const getDocRef = (collection, id) => db.collection(collection).doc(String(id))

const upsertDocument = async (collection, id, data) => {
  const payload = {
    _id: String(id),
    ...data,
    updatedAt: Timestamp.now(),
  }
  await getDocRef(collection, id).set(payload, { merge: true })
  return payload
}

const createRoleDocuments = async () => {
  console.log('Seeding roles...')
  for (const role of roles) {
    await upsertDocument('roles', role._id, role)
  }
}

const getOrCreateAuthUser = async (user) => {
  try {
    const existing = await auth.getUserByEmail(user.email)
    return existing
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      return await auth.createUser({
        email: user.email,
        emailVerified: true,
        displayName: user.name,
        password: SEED_PASSWORD,
      })
    }
    throw err
  }
}

const createUserDocuments = async () => {
  console.log('Seeding users...')
  const results = {}

  for (const profile of users) {
    const authUser = await getOrCreateAuthUser(profile)
    const profileData = {
      uid: authUser.uid,
      user_id: authUser.uid,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      phone: profile.phone || '',
      date_of_join: profile.date_of_join || new Date().toISOString().split('T')[0],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      ...(profile.relationship ? { relationship: profile.relationship } : {}),
      ...(profile.occupation ? { occupation: profile.occupation } : {}),
      ...(profile.address ? { address: profile.address } : {}),
      ...(profile.dob ? { dob: profile.dob } : {}),
      ...(profile.sex ? { sex: profile.sex } : {}),
    }

    await upsertDocument('users', authUser.uid, profileData)
    results[profile.email] = authUser.uid
  }

  return results
}

const createRoleProfiles = async (userIdToEmail) => {
  console.log('Seeding role-specific profiles...')
  if (!Array.isArray(seedStudentProfiles) || seedStudentProfiles.length === 0) {
    console.log('No student profiles configured in seed; skipping student/profile creation.')
    return
  }
  if (!Array.isArray(seedParentProfiles) || seedParentProfiles.length === 0) {
    console.log('No parent profiles configured in seed; skipping parent/profile creation.')
    return
  }

  const studentEntry = seedStudentProfiles[0]
  const parentEntry = seedParentProfiles[0]

  const studentUid = userIdToEmail[studentEntry.userEmail]
  const parentUid = userIdToEmail[parentEntry.userEmail]

  if (!studentUid || !parentUid) {
    throw new Error('Student or parent user not found in seeded auth users.')
  }

  await upsertDocument('students', studentUid, {
    userId: studentUid,
    student_id: studentEntry.student_id,
    studentId: studentEntry.student_id,
    firstName: 'Student',
    lastName: 'One',
    name: 'Student One',
    email: 'student1@esyncsms.com',
    phone: '+10000000005',
    dob: '2012-06-15',
    sex: 'Female',
    address: '123 Main Street',
    date_of_join: '2024-01-10',
    parentId: parentUid,
    role: 'student',
    classroom: studentEntry.classroom,
    parents: [parentUid],
  })

  await upsertDocument('parents', parentUid, {
    userId: parentUid,
    firstName: 'Parent',
    lastName: 'Guardian',
    name: 'Parent Guardian',
    email: 'parent1@esyncsms.com',
    phone: '+10000000004',
    relationship: parentEntry.relationship,
    address: '123 Main Street',
    occupation: parentEntry.occupation,
    role: 'parent',
    students: [studentUid],
  })
}

const createParentStudentLinks = async (userIdToEmail) => {
  console.log('Linking parent and student collections...')
  if (!Array.isArray(seedStudentProfiles) || seedStudentProfiles.length === 0 || !Array.isArray(seedParentProfiles) || seedParentProfiles.length === 0) {
    console.log('No parent/student entries configured in seed; skipping linking step.')
    return
  }

  const studentEntry = seedStudentProfiles[0]
  const parentEntry = seedParentProfiles[0]
  const studentUid = userIdToEmail[studentEntry.userEmail]
  const parentUid = userIdToEmail[parentEntry.userEmail]

  if (!studentUid || !parentUid) {
    throw new Error('Student or parent user not found for parent/student linkage.')
  }

  await getDocRef('parents', parentUid).set({ students: admin.firestore.FieldValue.arrayUnion(studentUid), updatedAt: Timestamp.now() }, { merge: true })
  await getDocRef('students', studentUid).set({ parentId: parentUid, updatedAt: Timestamp.now() }, { merge: true })
}

const run = async () => {
  console.log('Starting seed process...')
  await validateFirebaseCredentials()
  const userIdToEmail = await createUserDocuments()
  await createRoleDocuments()
  await createRoleProfiles(userIdToEmail)
  await createParentStudentLinks(userIdToEmail)
  console.log('\nSeed completed successfully.')
  console.log('Seeded auth users:')
  users.forEach((user) => console.log(` - ${user.email} / ${SEED_PASSWORD}`))
}

run().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
