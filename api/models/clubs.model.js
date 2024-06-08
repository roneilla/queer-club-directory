import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
	name: {
		type: String,
		required: false,
	},
});

const clubSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	description: {
		type: String,
		required: false,
	},
	instagram: {
		type: String,
		required: true,
		unique: true,
	},
	website: {
		type: String,
		required: false,
	},
	category: {
		type: String,
		required: true,
	},
	subcategories: {
		type: [subcategorySchema],
		required: false,
	},
	location: {
		type: String,
	},
	schedule: {
		type: String,
	},
	dateAdded: {
		type: Date,
	},
});

const Club = mongoose.model('Club', clubSchema);

export default Club;
