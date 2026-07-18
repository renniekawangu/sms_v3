import test from 'node:test'
import assert from 'node:assert/strict'
import { summarizeStudentAccount } from './studentAccount.js'

test('summarizes a student account from fees and payments', () => {
  const summary = summarizeStudentAccount(
    [
      { amount: 1000, amountPaid: 400 },
      { amount: 500, amountPaid: 500 },
    ],
    [
      { amount: 400 },
      { amount: 500 },
    ]
  )

  assert.equal(summary.totalFees, 1500)
  assert.equal(summary.totalPaid, 900)
  assert.equal(summary.outstandingBalance, 600)
  assert.equal(summary.paidPercentage, 60)
  assert.equal(summary.paymentCount, 2)
})
