import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;

let db;

export default async function getConnection() {
	if (db) return db;

	const client = new MongoClient(`${uri}`);

	db = await client.connect();
	return db;
}
