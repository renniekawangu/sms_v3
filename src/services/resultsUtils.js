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

export async function listStudentsForResultsInitialization(classroomId, listDocuments) {
  if (!classroomId || typeof listDocuments !== 'function') {
    return []
  }

  const byClassroomId = await listDocuments('students', { classroomId })
  if (Array.isArray(byClassroomId) && byClassroomId.length > 0) {
    return byClassroomId
  }

  const byLegacyField = await listDocuments('students', { classroom_id: classroomId })
  return Array.isArray(byLegacyField) ? byLegacyField : []
}
