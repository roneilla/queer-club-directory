import { Handler } from '@netlify/functions';
import getConnection from '../../../lib';

export const handler: Handler = async (event, context) => {
	try {
		const client = await getConnection();
		const database = client.db(process.env.MONGODB_DATABASE);
		const collection = database.collection('eventSubmissions');

		const { body } = event;
		const eventSub = JSON.parse(body || '');

		// Add the task to the database
		const result = await collection.insertOne(eventSub);

		return {
			statusCode: 200,
			body: JSON.stringify({ ...eventSub, _id: result.insertedId }),
		};
	} catch (error) {
		console.error('Error connecting to MongoDB Atlas', error);
		return {
			statusCode: 500,
			body: 'Internal Server Error',
		};
	}
};
