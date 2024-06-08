import Clubs from '../models/clubs.model.js';

export const getClubs = async (req, res, next) => {
	try {
		const clubs = await Clubs.find({});

		res.status(200).json(clubs);
	} catch (error) {
		next(error);
	}
};
