import test from 'node:test'
import assert from 'node:assert/strict'
import {
  RESULT_STATUSES,
  RESULT_STATUS_FILTER_OPTIONS,
  getResultStatusMeta,
  getResultTransition,
  normalizeResultStatus,
} from './resultWorkflow.js'

test('shared workflow constants expose the expected status values', () => {
  assert.deepEqual(Object.values(RESULT_STATUSES), ['draft', 'submitted', 'approved', 'published', 'rejected'])
})

test('status transitions are derived from the shared workflow map', () => {
  assert.deepEqual(getResultTransition(RESULT_STATUSES.DRAFT), {
    action: 'submit',
    nextStatus: RESULT_STATUSES.SUBMITTED,
    actionLabel: 'submitted',
  })
  assert.deepEqual(getResultTransition(RESULT_STATUSES.SUBMITTED), {
    action: 'approve',
    nextStatus: RESULT_STATUSES.APPROVED,
    actionLabel: 'approved',
  })
  assert.deepEqual(getResultTransition(RESULT_STATUSES.APPROVED), {
    action: 'publish',
    nextStatus: RESULT_STATUSES.PUBLISHED,
    actionLabel: 'published',
  })
})

test('status metadata and filter options stay aligned', () => {
  const draftMeta = getResultStatusMeta(RESULT_STATUSES.DRAFT)
  const submittedMeta = getResultStatusMeta(RESULT_STATUSES.SUBMITTED)

  assert.equal(draftMeta.label, 'Draft')
  assert.equal(submittedMeta.label, 'Pending Approval')
  assert.ok(RESULT_STATUS_FILTER_OPTIONS.some((option) => option.value === RESULT_STATUSES.SUBMITTED))
  assert.equal(normalizeResultStatus('Submitted'), RESULT_STATUSES.SUBMITTED)
  assert.equal(normalizeResultStatus('submit'), RESULT_STATUSES.SUBMITTED)
  assert.equal(normalizeResultStatus('approve'), RESULT_STATUSES.APPROVED)
  assert.equal(normalizeResultStatus('publish'), RESULT_STATUSES.PUBLISHED)
})
