import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeRole, canAccessRoute, ROLES } from './rbac.js'

test('normalizeRole falls back to student when role is missing', () => {
  assert.equal(normalizeRole(undefined), ROLES.STUDENT)
  assert.equal(normalizeRole(''), ROLES.STUDENT)
})

test('normalizeRole accepts common role variants', () => {
  assert.equal(normalizeRole('HEAD-TEACHER'), ROLES.HEAD_TEACHER)
  assert.equal(normalizeRole('  admin  '), ROLES.ADMIN)
  assert.equal(normalizeRole('accounts'), ROLES.ACCOUNTS)
})

test('canAccessRoute uses normalized roles', () => {
  assert.equal(canAccessRoute('HEAD-TEACHER', '/teachers'), true)
  assert.equal(canAccessRoute('  parent  ', '/children'), true)
  assert.equal(canAccessRoute('unknown-role', '/students'), false)
})
