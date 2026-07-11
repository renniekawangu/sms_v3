import test from 'node:test'
import assert from 'node:assert/strict'
import { listStudentsForResultsInitialization, calculateGrade } from './resultsUtils.js'

test('calculateGrade derives letter grades from score and maxMarks', () => {
  assert.equal(calculateGrade(92, 100), 'A+')
  assert.equal(calculateGrade(78, 100), 'B+')
  assert.equal(calculateGrade(45, 100), 'F')
  assert.equal(calculateGrade(38, 50), 'B+')
  assert.equal(calculateGrade(0, 100), 'F')
})

test('calculateGrade returns an empty string for ungraded results', () => {
  assert.equal(calculateGrade(null, 100), '')
  assert.equal(calculateGrade(undefined, 100), '')
  assert.equal(calculateGrade('', 100), '')
  assert.equal(calculateGrade(50, 0), '')
})

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
