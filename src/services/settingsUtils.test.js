import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAcademicYearsResponse } from './settingsUtils.js';

test('normalizes array responses into academic years payload', () => {
  const result = normalizeAcademicYearsResponse([{ _id: '1', year: '2024/2025' }]);

  assert.deepEqual(result, {
    academicYears: [{ _id: '1', year: '2024/2025' }],
    currentYear: null,
  });
});

test('keeps object responses with current year metadata', () => {
  const result = normalizeAcademicYearsResponse({
    academicYears: [{ _id: '1', year: '2024/2025' }],
    currentYear: { _id: '1', year: '2024/2025' },
  });

  assert.deepEqual(result, {
    academicYears: [{ _id: '1', year: '2024/2025' }],
    currentYear: { _id: '1', year: '2024/2025' },
  });
});
