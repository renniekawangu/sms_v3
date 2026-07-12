// Percentage-based grade boundaries. Adjust here if your school uses a
// different scale — this is the single source of truth for grade letters.
const GRADE_BOUNDARIES = [
  { min: 90, grade: 'A+' },
  { min: 80, grade: 'A' },
  { min: 75, grade: 'B+' },
  { min: 70, grade: 'B' },
  { min: 65, grade: 'C+' },
  { min: 60, grade: 'C' },
  { min: 50, grade: 'D' },
  { min: 0, grade: 'F' },
]

/**
 * Derives a letter grade from a raw score and the exam's max marks.
 * Returns '' when the score isn't a valid number (e.g. not yet entered),
 * so callers can distinguish "ungraded" from an actual grade.
 */
export function calculateGrade(score, maxMarks = 100) {
  if (score === null || score === undefined || score === '') {
    return ''
  }

  const numericScore = Number(score)
  const numericMax = Number(maxMarks)

  if (!Number.isFinite(numericScore) || !Number.isFinite(numericMax) || numericMax <= 0) {
    return ''
  }

  const percentage = (numericScore / numericMax) * 100
  const match = GRADE_BOUNDARIES.find(({ min }) => percentage >= min)
  return match ? match.grade : 'F'
}

export function normalizeClassroomKey(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim()
}

export function buildClassroomLookupValues(classroomDoc = {}) {
  const doc = classroomDoc || {}
  const values = []
  const candidates = [
    doc.className,
    doc.name,
    doc.classroomName,
    doc.label,
    doc.grade && doc.section ? `${doc.grade}${doc.section}` : null,
    doc.grade && doc.section ? `${doc.grade} ${doc.section}` : null,
    doc.grade && doc.section ? `grade${doc.grade}${doc.section}` : null,
    doc.grade && doc.section ? `grade ${doc.grade} ${doc.section}` : null,
    doc.grade && doc.section ? `${doc.grade}-${doc.section}` : null,
  ].filter(Boolean)

  candidates.forEach((value) => {
    const normalized = normalizeClassroomKey(value)
    if (normalized) values.push(normalized)
  })

  return Array.from(new Set(values))
}

export function matchesClassroomValue(studentValue, lookupValues) {
  const normalizedStudentValue = normalizeClassroomKey(studentValue)
  if (!normalizedStudentValue) return false
  return lookupValues.some((value) => normalizedStudentValue.includes(value) || value.includes(normalizedStudentValue))
}

export async function listStudentsForResultsInitialization(classroomId, listDocuments, classroomDoc = null) {
  if (!classroomId || typeof listDocuments !== 'function') {
    return []
  }

  const byClassroomId = await listDocuments('students', { classroomId })
  if (Array.isArray(byClassroomId) && byClassroomId.length > 0) {
    return byClassroomId
  }

  const byLegacyField = await listDocuments('students', { classroom_id: classroomId })
  if (Array.isArray(byLegacyField) && byLegacyField.length > 0) {
    return byLegacyField
  }

  const lookupValues = buildClassroomLookupValues(classroomDoc)
  if (lookupValues.length > 0) {
    const allStudents = await listDocuments('students').catch(() => [])
    const matchedStudents = (Array.isArray(allStudents) ? allStudents : []).filter((student) => {
      const classroomValue = student?.classroom || student?.classroomId || student?.classroom_id
      return matchesClassroomValue(classroomValue, lookupValues)
    })

    if (matchedStudents.length > 0) {
      return matchedStudents
    }

    if (Array.isArray(allStudents) && allStudents.length === 1) {
      return allStudents
    }
  }

  return []
}
