import test from 'node:test'
import assert from 'node:assert/strict'
import { listStudentsForResultsInitialization } from './resultsUtils.js'

test('prefers classroomId lookup and falls back to the legacy classroom_id field', async () => {
  const listDocuments = async (_collection, params) => {
    if (params.classroomId) return [{ _id: 'a' }]
    if (params.classroom_id) return [{ _id: 'b' }]
    return []
  }

  const firstResult = await listStudentsForResultsInitialization('class-1', listDocuments)
  assert.deepEqual(firstResult, [{ _id: 'a' }])

  const fallbackResult = await listStudentsForResultsInitialization('class-2', async () => [])
  assert.deepEqual(fallbackResult, [])
})
