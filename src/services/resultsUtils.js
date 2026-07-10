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
