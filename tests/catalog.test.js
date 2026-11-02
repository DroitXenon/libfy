import { test } from 'node:test';
import assert from 'node:assert/strict';
import { libraries, searchLibraries } from '../src/catalog.js';

test('search finds libraries by name, use case, and case-insensitive terms', () => {
  assert.deepEqual(searchLibraries({ query: 'ZOD' }).map(lib => lib.id), ['zod']);
  assert.ok(searchLibraries({ query: 'charts' }).some(lib => lib.id === 'recharts'));
  assert.equal(searchLibraries({ query: 'nonexistent-library-xyz' }).length, 0);
});
test('search combines category and language constraints', () => {
  const results = searchLibraries({ category: 'Backend', language: 'TypeScript' });
  assert.deepEqual(results.map(lib => lib.id), ['drizzle']);
});
test('collections only show saved libraries and handle an empty collection', () => {
  assert.equal(searchLibraries({ saved: [] }).length, 0);
  assert.deepEqual(searchLibraries({ saved: ['zod', 'react'] }).map(lib => lib.id), ['react', 'zod']);
});
test('project matching ranks relevant libraries and has an honest no-match result', () => {
  assert.equal(searchLibraries({ project: 'charts visualization analytics' })[0].id, 'recharts');
  assert.ok(searchLibraries({ project: 'SQL database' }).some(lib => lib.id === 'drizzle'));
  assert.equal(searchLibraries({ project: 'astronomy telescope' }).length, 0);
});
test('catalog entries have unique IDs and HTTPS documentation links', () => {
  assert.equal(new Set(libraries.map(lib => lib.id)).size, libraries.length);
  libraries.forEach(lib => { assert.equal(new URL(lib.url).protocol, 'https:'); assert.ok(lib.fit && lib.tradeoff && lib.install); });
});
