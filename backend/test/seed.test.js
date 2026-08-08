import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSeedData, MOCK_MOVIES, seedDatabase } from '../scripts/seed.js';

function fakePool(failPattern) {
  const statements = [];
  const client = { async query(sql) { statements.push(sql); if (failPattern && sql.includes(failPattern)) throw new Error('database failure'); return { rows: [], rowCount: 0 }; }, release() {} };
  return { statements, async connect() { return client; } };
}
test('fictional catalogue is deterministic and local', () => { assert.equal(MOCK_MOVIES.length, 8); assert.equal(new Set(MOCK_MOVIES.map(({ id }) => id)).size, 8); assert.ok(MOCK_MOVIES.every(({ posterUrl }) => posterUrl.startsWith('/public/catalogue/'))); });
test('seed data creates seven days of inventory', () => { const d=buildSeedData(MOCK_MOVIES,new Date('2026-08-08T03:00:00Z')); assert.equal(d.theatres.length,3); assert.equal(d.seats.length,480); assert.equal(d.showtimes.length,126); assert.equal(d.showtimeSeats.length,10080); });
test('seeding truncates all application data and commits', async () => { const pool=fakePool(); const c=await seedDatabase({pool,now:new Date('2026-08-08T00:00:00Z')}); assert.equal(c.movies,8); assert.ok(pool.statements.some(sql=>sql.includes('"SeatHold"')&&sql.includes('"User"'))); assert.equal(pool.statements[0],'BEGIN'); assert.equal(pool.statements.at(-1),'COMMIT'); });
test('insertion failure rolls back', async () => { const pool=fakePool('INSERT INTO "Movie"'); await assert.rejects(()=>seedDatabase({pool}),/database failure/); assert.equal(pool.statements.at(-1),'ROLLBACK'); });
