import express from 'express';
import { getClubs } from '../controllers/clubs.controller.js';

const clubRouter = express.Router();

clubRouter.get('/getClubs', getClubs);

export default clubRouter;
