import { build } from 'esbuild';
import { strict as assert } from 'node:assert';
import { test } from 'node:test';

let calls = 0;
let saved;
globalThis.__adminTestDb = { db: () => ({ collection: (name) => {
 assert.equal(name, globalThis.__expectedCollection || 'clubs');
 return { insertOne: async (club) => { calls++; saved = club; return { insertedId: 'test-id' }; } };
} }) };
const result = await build({
 entryPoints: ['netlify/functions/adminAddClub/adminAddClub.ts', 'netlify/functions/addAClub/addAClub.ts'], outdir: 'test-output', bundle: true, platform: 'node', format: 'esm', write: false,
 plugins: [{ name: 'mock-db', setup(builder) {
  builder.onResolve({ filter: /^\.\/index\.js$/ }, () => ({ path: 'db', namespace: 'mock' }));
  builder.onLoad({ filter: /.*/, namespace: 'mock' }, () => ({ contents: 'export default async () => globalThis.__adminTestDb;' }));
 } }],
});
const { handler: publicHandler } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[1].text).toString('base64')}`);
const { handler } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
const key = 'a'.repeat(64);
const valid = { name: 'Test club', description: 'Test description', category: 'arts', website: 'https://example.com' };
const request = (overrides = {}) => handler({ httpMethod: 'POST', headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' }, body: JSON.stringify(valid), ...overrides });

test('admin authorization, validation and whitelisted database writes', async () => {
 delete process.env.ADMIN_ACCESS_KEY;
 assert.equal((await request()).statusCode, 503);
 process.env.ADMIN_ACCESS_KEY = key;
 assert.equal((await request({ headers: {} })).statusCode, 401);
 assert.equal((await request({ headers: { authorization: 'Bearer wrong' } })).statusCode, 401);
 assert.equal((await request({ httpMethod: 'DELETE' })).statusCode, 405);
 assert.equal((await request({ httpMethod: 'GET' })).statusCode, 200);
 assert.equal((await request({ body: '{' })).statusCode, 400);
 for (const input of [null, [], { ...valid, name: '' }, { ...valid, name: { $gt: '' } }, { ...valid, category: 'unknown' }, { ...valid, website: 'javascript:alert(1)' }]) {
  assert.equal((await request({ body: JSON.stringify(input) })).statusCode, 400);
 }
 assert.equal(calls, 0);
 assert.equal((await request({ body: JSON.stringify({ ...valid, _id: 'injected', status: 'injected', instagram: '@test' }) })).statusCode, 201);
 assert.equal(calls, 1);
 assert.equal(saved.name, valid.name);
 assert.equal(saved.instagram, 'test');
 assert.deepEqual(saved.subcategories, []);
 assert.equal(saved._id, undefined);
 assert.equal(saved.status, undefined);
 delete process.env.ADMIN_ACCESS_KEY;
 globalThis.__expectedCollection = 'clubSubmissions';
 const publicRequest = (overrides = {}) => publicHandler({ httpMethod: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...valid, collection: 'clubs', admin: true, status: 'approved' }), ...overrides });
 assert.equal((await publicRequest()).statusCode, 201);
 assert.equal(saved.status, 'submitted');
 assert.equal(saved.collection, undefined);
 assert.equal(saved.admin, undefined);
 assert.equal((await publicRequest({ httpMethod: 'GET' })).statusCode, 405);
 assert.equal((await publicRequest({ body: '{}' })).statusCode, 400);
 assert.equal(calls, 2);
 delete globalThis.__expectedCollection;
 delete globalThis.__adminTestDb;
});
