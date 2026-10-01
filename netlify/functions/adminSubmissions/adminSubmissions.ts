import { Handler } from '@netlify/functions';
import { ObjectId } from 'mongodb';
import getConnection from '../../../lib/index.js';
import { adminAuth } from '../../../lib/adminAuth';
import { validateClub } from '../../../lib/clubValidation';

const reply = (statusCode: number, body: object) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) });
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const instagramHandle = (value: unknown) => {
 if (typeof value !== 'string') return '';
 const handle = value.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?instagram\.com\//, '').replace(/^@/, '').split(/[/?#]/)[0];
 return /^[a-z0-9._]+$/.test(handle) && !['n', 'na', 'none'].includes(handle) ? handle : '';
};
const fields = ['name', 'description', 'instagram', 'website', 'category', 'location', 'schedule'];
class ReviewError extends Error { constructor(public status: number, message: string) { super(message); } }

export const handler: Handler = async (event) => {
 const failure = adminAuth(event.headers);
 if (failure) return reply(failure.statusCode, { error: failure.error });
 if (!['GET', 'POST'].includes(event.httpMethod)) return reply(405, { error: 'Method not allowed.' });
 try {
  let input;
  if (event.httpMethod === 'POST') {
   if (!event.headers['content-type']?.startsWith('application/json')) return reply(415, { error: 'Expected JSON.' });
   if (!event.body || event.body.length > 20000) return reply(400, { error: 'Invalid request size.' });
   try { input = JSON.parse(event.body); } catch { return reply(400, { error: 'Invalid JSON.' }); }
   if (!input || !['save', 'approve', 'reject'].includes(input.action) || !/^[a-f0-9]{24}$/i.test(input.id || '') || !['clubSubmissions', 'clubsubmissions'].includes(input.collection)) return reply(400, { error: 'Invalid review action.' });
  }
  const client = await getConnection();
  const db = client.db(process.env.MONGODB_DATABASE);
  if (event.httpMethod === 'GET') {
   const clubs = await db.collection('clubs').find({}, { projection: { name: 1, instagram: 1 } }).toArray();
   const rows = [];
   for (const collection of ['clubSubmissions', 'clubsubmissions']) {
    const submissions = await db.collection(collection).find({}).toArray();
    for (const submission of submissions) {
     const name = normalize(submission.name || '');
     const instagram = instagramHandle(submission.instagram);
     const existing = clubs.find(c =>
      String(c._id) === String(submission.approvedClubId || submission._id) ||
      (name && normalize(c.name || '') === name));
     const sharedInstagram = !existing && instagram ? clubs.find(c => instagramHandle(c.instagram) === instagram) : undefined;
     rows.push({ _id: String(submission._id), collection, status: submission.status || 'submitted', dateSubmitted: submission.dateSubmitted || '', ...Object.fromEntries(fields.map(f => [f, typeof submission[f] === 'string' ? submission[f] : ''])), existingClub: existing?.name || null, sharedInstagramClub: sharedInstagram?.name || null });
    }
   }
   rows.sort((a,b) => b.dateSubmitted.localeCompare(a.dateSubmitted));
   return reply(200, { submissions: rows });
  }
  const collection = db.collection(input.collection);
  const id = new ObjectId(input.id);
  let edits: Record<string, string> = {};
  if (input.action !== 'reject') {
   if (!input.club || typeof input.club !== 'object' || Array.isArray(input.club)) return reply(400, { error: 'Expected club fields.' });
   for (const field of fields) {
    const value = input.club[field] ?? '';
    if (typeof value !== 'string' || value.length > 3000) return reply(400, { error: `Invalid ${field}.` });
    edits[field] = value.trim();
   }
   if (input.action === 'approve') {
    try { edits = validateClub(edits); } catch (error) { return reply(400, { error: (error as Error).message }); }
   }
  }
  const session = client.startSession();
  try {
   await session.withTransaction(async () => {
    const submission = await collection.findOne({ _id: id }, { session });
    if (!submission) throw new ReviewError(404, 'Submission not found.');
    if (input.action === 'save') {
     await collection.updateOne({ _id: id }, { $set: edits }, { session });
     return;
    }
    if (input.action === 'reject') {
     await collection.updateOne({ _id: id }, { $set: { status: 'rejected', reviewedAt: new Date() } }, { session });
     return;
    }
    const clubs = db.collection('clubs');
    const allClubs = await clubs.find({}, { session }).toArray();
    const linked = allClubs.find(c => String(c._id) === String(submission.approvedClubId || id));
    const sameName = allClubs.find(c => normalize(c.name || '') === normalize(edits.name));
    const target = linked || sameName;
    const clubId = target?._id || id;
    // Preserve existing tags; approval explicitly publishes the edited fields.
    await clubs.updateOne({ _id: clubId }, { $set: { ...edits, updatedAt: new Date().toISOString() }, $setOnInsert: { dateAdded: new Date().toISOString(), subcategories: [], dateSubmitted: submission.dateSubmitted || new Date().toISOString().slice(0,10) } }, { upsert: true, session });
    await collection.updateOne({ _id: id }, { $set: { ...edits, status: 'approved', approvedClubId: clubId, reviewedAt: new Date() } }, { session });
   });
  } finally { await session.endSession(); }
  return reply(200, { success: true });
 } catch (error) {
  if (error instanceof ReviewError) return reply(error.status, { error: error.message });
  if ((error as { code?: number }).code === 11000) return reply(409, { error: 'A club already uses this name or Instagram value (including a blank handle). Edit the entry or reject it as a duplicate. Nothing was approved.' });
  return reply(500, { error: 'Could not complete the review. Please retry.' });
 }
};
