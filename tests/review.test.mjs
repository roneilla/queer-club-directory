import { build } from 'esbuild';
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { ObjectId } from 'mongodb';
const id = new ObjectId().toString();
let state, connections = 0, conflict = false;
const reset = () => { state = { clubSubmissions: [{ _id: id, name: 'Test', description: 'Description', category: 'arts', instagram: 'test', status: 'submitted' }], clubsubmissions: [], clubs: [] }; conflict = false; };
const same = (a,b) => String(a) === String(b);
const session = { async withTransaction(fn) { const before = structuredClone(state); try { await fn(); } catch(e) { state = before; throw e; } }, async endSession() {} };
globalThis.__reviewClient = { startSession: () => session, db: () => ({ collection: name => ({
 find: () => ({ toArray: async () => state[name] }),
 findOne: async query => state[name].find(r => same(r._id,query._id)),
 updateOne: async (query, update, options = {}) => {
  if (name === 'clubs' && conflict) throw Object.assign(new Error('duplicate'), { code: 11000 });
  let row = state[name].find(r => same(r._id,query._id));
  if (!row && options.upsert) { row = { _id: String(query._id), ...update.$setOnInsert }; state[name].push(row); }
  if (row) Object.assign(row, update.$set);
 }
}) }) };
globalThis.__connectReview = () => { connections++; return globalThis.__reviewClient; };
const output = await build({ entryPoints: ['netlify/functions/adminSubmissions/adminSubmissions.ts'], bundle: true, platform: 'node', format: 'esm', packages: 'external', write: false, plugins: [{ name: 'mock', setup(b) { b.onResolve({filter: /lib\/index\.js$/}, () => ({path:'db',namespace:'mock'})); b.onLoad({filter:/.*/,namespace:'mock'}, () => ({contents:'export default async () => globalThis.__connectReview();'})); } }] });
// Use a temporary module in this directory so external mongodb resolves normally.
import { writeFileSync, unlinkSync } from 'node:fs';
const path = new URL('./.review-test-bundle.mjs', import.meta.url);
writeFileSync(path, output.outputFiles[0].text);
const {handler} = await import(path.href);
unlinkSync(path);
const key = 'a'.repeat(64);
const request = (action, extra = {}) => handler({ httpMethod: action ? 'POST' : 'GET', headers: { authorization: `Bearer ${key}`, 'content-type':'application/json' }, body: JSON.stringify({action, id, collection:'clubSubmissions', club: { name:'Test',description:'Edited description',category:'arts',instagram:'test' }}), ...extra });
test('review authorization, edits, approval, retry, rejection and rollback', async () => {
 reset(); delete process.env.ADMIN_ACCESS_KEY;
 assert.equal((await request()).statusCode,503);
 process.env.ADMIN_ACCESS_KEY=key;
 assert.equal((await request(undefined,{headers:{}})).statusCode,401);
 assert.equal(connections,0);
 assert.equal((await request('save',{body:'{'})).statusCode,400);
 assert.equal((await request()).statusCode,200);
 assert.equal((await request('save')).statusCode,200);
 assert.equal(state.clubs.length,0);
 assert.equal(state.clubSubmissions[0].description,'Edited description');
 assert.equal((await request('approve')).statusCode,200);
 assert.equal(state.clubs.length,1);
 assert.deepEqual(state.clubs[0].subcategories,[]);
 assert.equal(state.clubSubmissions[0].status,'approved');
 assert.equal(JSON.parse((await request()).body).submissions.length,1);
 assert.equal(JSON.parse((await request()).body).submissions[0].status,'approved');
 assert.equal((await request('approve')).statusCode,200);
 assert.equal(state.clubs.length,1);
 assert.equal((await request('reject')).statusCode,200);
 assert.equal(state.clubs.length,1);
 assert.equal(state.clubSubmissions[0].status,'rejected');
 assert.equal(JSON.parse((await request()).body).submissions[0].status,'rejected');
 reset(); conflict=true;
 assert.equal((await request('approve')).statusCode,409);
 assert.equal(state.clubSubmissions[0].status,'submitted');
 assert.equal(state.clubs.length,0);
 reset();state.clubs.push({_id:'other',name:'Test',subcategories:[{name:'Music'}]});
 assert.equal((await request('approve')).statusCode,200);
 assert.equal(state.clubs.length,1);
 assert.deepEqual(state.clubs[0].subcategories,[{name:'Music'}]);
 assert.equal(state.clubs[0].description,'Edited description');
 reset();
 state.clubs.push({_id:'existing',name:'Already Listed',instagram:'listed.handle'});
 state.clubSubmissions = [
  {_id:'linked',name:'Renamed',approvedClubId:'existing'},
  {_id:'name',name:' already listed! '},
  {_id:'instagram',name:'Different name',instagram:'https://www.instagram.com/Listed.Handle/'},
  {_id:'blank',name:'New club',instagram:''},
  {_id:'other-handle',name:'Another club',instagram:'other.handle'},
 ];
 state.clubsubmissions = [{_id:'legacy',name:'Other spelling',instagram:'@listed.handle'}];
 const allRows=JSON.parse((await request()).body).submissions;
 assert.deepEqual(allRows.map(s=>s._id),['linked','name','instagram','blank','other-handle','legacy']);
 assert.equal(allRows.find(s=>s._id==='linked').existingClub,'Already Listed');
 assert.equal(allRows.find(s=>s._id==='instagram').existingClub,null);
 assert.equal(allRows.find(s=>s._id==='instagram').sharedInstagramClub,'Already Listed');
 assert.equal(state.clubSubmissions.length,5);
 reset();
 const approval = await request('approve', { body: JSON.stringify({action:'approve',id,collection:'clubSubmissions',club:{name:'Run It Back: Free Queer Movies',description:'Free year-round screening series hosted by Inside Out.',instagram:'insideoutfestival',website:'https://insideout.ca/initiatives/run-it-back/',category:'entertainment',location:'Paradise Theatre',schedule:'Year-round'}}) });
 assert.equal(approval.statusCode,200);
 assert.equal(state.clubs[0].instagram,'insideoutfestival');
 assert.equal(state.clubSubmissions[0].status,'approved');
 delete process.env.ADMIN_ACCESS_KEY;
});
