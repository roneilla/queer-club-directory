import { Handler } from '@netlify/functions';
import getConnection from '../../../lib';

export const handler: Handler = async (event, context) => {
	try {
		const client = await getConnection();
		const database = client.db(process.env.MONGODB_DATABASE);
		const collection = database.collection('events');

		const data = await collection.find().toArray();

		return {
			statusCode: 200,
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
