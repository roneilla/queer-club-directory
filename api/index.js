import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import clubRouter from './routes/clubs.routes.js';
dotenv.config();

mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => {
		console.log('connected');
	})
	.catch((err) => {
		console.log('error ' + err);
	});

const app = express();

app.listen(3000, () => {
	console.log('server is running on port 3000');
});

app.use('/api/clubs', clubRouter);
