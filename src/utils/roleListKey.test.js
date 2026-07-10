import test from 'node:test';
import assert from 'node:assert/strict';
import { getRoleIdentifier, getRoleListKey } from './roleListKey.js';

test('prefers stable ids and falls back to a unique name-based key', () => {
  assert.equal(getRoleIdentifier({ _id: 'role-1' }), 'role-1');
  assert.equal(getRoleIdentifier({ role_id: '3' }), '3');
  assert.equal(getRoleIdentifier({ name: 'Admin' }, 1), 'Admin-1');
  assert.equal(getRoleListKey({ _id: 'role-1' }, 0), 'role-1');
  assert.equal(getRoleListKey({ name: 'Admin' }, 1), 'Admin-1');
});
