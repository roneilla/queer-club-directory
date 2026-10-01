import { Handler } from '@netlify/functions';
import { adminAuth } from './adminAuth';
import { validateClub } from './clubValidation';
import getConnection from './index.js';

const reply = (statusCode: number, body: object) => ({
	statusCode,
	headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
	body: JSON.stringify(body),
});

export const createClubHandler = (admin: boolean): Handler => async (event) => {
	if (!(admin ? ['GET', 'POST'] : ['POST']).includes(event.httpMethod)) {
		return { ...reply(405, { error: 'Method not allowed.' }), headers: { ...reply(405, {}).headers, Allow: admin ? 'GET, POST' : 'POST' } };
	}
	if (admin) {
		const failure = adminAuth(event.headers);
		if (failure) return reply(failure.statusCode, { error: failure.error });
		if (event.httpMethod === 'GET') return reply(200, { authenticated: true });
	}
	if (!event.headers['content-type']?.toLowerCase().startsWith('application/json')) {
		return reply(415, { error: 'Expected application/json.' });
	}
	if (!event.body || event.body.length > 20000) return reply(400, { error: 'Invalid request size.' });
	let input;
	try { input = JSON.parse(event.body); } catch { return reply(400, { error: 'Invalid JSON.' }); }
	if (!input || typeof input !== 'object' || Array.isArray(input)) return reply(400, { error: 'Expected a club object.' });
	let club;
	try { club = validateClub(input); } catch (error) { return reply(400, { error: (error as Error).message }); }
	try {
		const client = await getConnection();
		const result = await client.db(process.env.MONGODB_DATABASE).collection(admin ? 'clubs' : 'clubSubmissions').insertOne({
			...club, ...(admin ? { dateAdded: new Date().toISOString(), updatedAt: new Date().toISOString() } : { status: 'submitted' }), subcategories: [], dateSubmitted: new Date().toISOString().slice(0, 10),
		});
		return reply(201, { _id: result.insertedId });
	} catch {
		return reply(500, { error: 'Could not save the club. Please try again.' });
	}
};
