import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeChildCollection, matchesStudentReference, getNumericPercentage, summarizeFees } from './parentDataUtils.js'

test('normalizeChildCollection returns arrays from common payload shapes', () => {
  assert.deepEqual(normalizeChildCollection([{ id: 1 }]), [{ id: 1 }])
  assert.deepEqual(normalizeChildCollection({ results: [{ id: 2 }] }), [{ id: 2 }])
  assert.deepEqual(normalizeChildCollection({ data: [{ id: 3 }] }), [{ id: 3 }])
  assert.deepEqual(normalizeChildCollection({ children: [{ id: 4 }] }), [{ id: 4 }])
  assert.deepEqual(normalizeChildCollection({ fees: [{ id: 5 }] }), [{ id: 5 }])
  assert.deepEqual(normalizeChildCollection({ foo: 'bar' }), [])
})

test('matchesStudentReference resolves both student document ids and student codes', () => {
  const record = {
    studentId: 'STU1001',
    student: {
      _id: '9bVrcszD7FYFZ6yA0ZbLOgmCyk72',
      studentId: 'STU1001',
    },
  }

  assert.equal(matchesStudentReference(record, '9bVrcszD7FYFZ6yA0ZbLOgmCyk72'), true)
  assert.equal(matchesStudentReference(record, 'STU1001'), true)
  assert.equal(matchesStudentReference(record, 'another-id'), false)
})

test('getNumericPercentage derives values from score and maxMarks data', () => {
  assert.equal(getNumericPercentage({ score: 99, maxMarks: 100 }), 99)
  assert.equal(getNumericPercentage({ percentage: 88 }), 88)
  assert.equal(getNumericPercentage({ grade: 'A+' }), 95)
})

test('summarizeFees combines fee totals with payments', () => {
  const summary = summarizeFees([
    { _id: 'fee-1', amount: 1000 },
    { _id: 'fee-2', amount: 500 },
  ], [
    { feeId: 'fee-1', amount: 400 },
    { feeId: 'fee-2', amount: 500 },
  ])

  assert.deepEqual(summary, {
    totalFees: 1500,
    totalPaid: 900,
    pendingFees: 600,
  })
})
