import { Handler } from '@netlify/functions';
import getConnection from '../../../lib';

export const handler: Handler = async () => {
	try {
		const client = await getConnection();
		const database = client.db(process.env.MONGODB_DATABASE);
		const collection = database.collection('clubs');

		const data = await collection.find({ archived: { $ne: true } }).toArray();

		return {
			statusCode: 200,
            headers: { 'Cache-Control': 'no-store' },
			body: JSON.stringify(data),
		};
	} catch (error) {
		console.error('Error connecting to MongoDB Atlas', error);
		return {
			statusCode: 500,
			body: 'Internal Server Error',
		};
	}
};
