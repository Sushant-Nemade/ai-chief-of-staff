import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { buildBrief } from '../lib/brief.mjs';
test('sorts events and flags action emails', () => {
  const brief = buildBrief([{ start: '11:00', title: 'B' }, { start: '09:00', title: 'A' }], [{ subject: 'Review proposal', snippet: '' }], '2026-09-27');
  assert.equal(brief.events[0].title, 'A');
  assert.equal(brief.actions.length, 1);
});
