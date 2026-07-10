import test from 'node:test';
import assert from 'node:assert/strict';
import { hasRequiredRole } from './rbacAccess.js';

test('matches roles after normalization', () => {
  assert.equal(hasRequiredRole('Admin', 'admin'), true);
  assert.equal(hasRequiredRole('HEAD-TEACHER', 'head-teacher'), true);
  assert.equal(hasRequiredRole('teacher', 'Teacher'), true);
  assert.equal(hasRequiredRole('student', 'admin'), false);
});
