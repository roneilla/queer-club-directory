import { Handler } from '@netlify/functions';
import { ObjectId } from 'mongodb';
import getConnection from '../../../lib/index.js';
import { adminAuth } from '../../../lib/adminAuth';
import { validateClub } from '../../../lib/clubValidation';
const reply = (statusCode: number, body: object) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) });
export const handler: Handler = async event => {
 const failure = adminAuth(event.headers);
 if (failure) return reply(failure.statusCode, { error: failure.error });
 if (!['GET', 'POST'].includes(event.httpMethod)) return reply(405, { error: 'Method not allowed.' });
 try {
  let id: ObjectId | undefined;
  let edits: Record<string, unknown> = {};
  if (event.httpMethod === 'POST') {
   if (!event.headers['content-type']?.startsWith('application/json')) return reply(415, { error: 'Expected JSON.' });
   if (!event.body || event.body.length > 20000) return reply(400, { error: 'Invalid request size.' });
   let input;
   try { input = JSON.parse(event.body); } catch { return reply(400, { error: 'Invalid JSON.' }); }
   if (!input || !/^[a-f0-9]{24}$/i.test(input.id || '')) return reply(400, { error: 'Invalid club update.' });
   id = new ObjectId(input.id);
   if (input.action === 'archive' || input.action === 'restore') {
    edits = { archived: input.action === 'archive' };
   } else {
   if (input.action && input.action !== 'save') return reply(400, { error: 'Invalid action.' });
   if (!input.club || typeof input.club !== 'object' || Array.isArray(input.club)) return reply(400, { error: 'Invalid club update.' });
   try {
    // Existing directory records may legitimately have no description.
    edits = validateClub(input.club, false);
   } catch(e) { return reply(400, { error: (e as Error).message }); }
   if (!Array.isArray(input.club.subcategories) || input.club.subcategories.length > 30 || input.club.subcategories.some((tag: unknown) => !tag || typeof tag !== 'object' || typeof (tag as {name?:unknown}).name !== 'string' || !(tag as {name:string}).name.trim() || (tag as {name:string}).name.length > 80)) return reply(400, { error: 'Tags must contain names of 1–80 characters (maximum 30 tags).' });
   edits.subcategories = [...new Set(input.club.subcategories.map((tag: {name:string}) => tag.name.trim()))].map(name => ({name}));
   }
   edits.updatedAt = new Date().toISOString();
  }
  const client = await getConnection();
  const clubs = client.db(process.env.MONGODB_DATABASE).collection('clubs');
  if (event.httpMethod === 'GET') return reply(200, { clubs: await clubs.find({}, { projection: { name:1,description:1,instagram:1,website:1,category:1,location:1,schedule:1,subcategories:1,dateAdded:1,updatedAt:1,archived:1 } }).sort({name:1}).toArray() });
  const result = await clubs.updateOne({ _id: id }, { $set: edits });
  if (!result.matchedCount) return reply(404, { error: 'This club no longer exists. Refresh the directory.' });
  return reply(200, { club: { ...edits, _id: String(id) } });
 } catch(e) {
  if ((e as {code?:number}).code === 11000) return reply(409, { error: 'Another club already uses this name or Instagram value. Your changes were not saved.' });
  return reply(500, { error: 'Could not save or load clubs. Please retry.' });
 }
};
