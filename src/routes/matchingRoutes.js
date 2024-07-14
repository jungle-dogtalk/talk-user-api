import express from 'express';
import { getUserMatch, addUserToQueue } from '../controllers/Cmatching.js';
// import { addUserToQueue } from '../controllers/RmatchingController.js';

const router = express.Router();

router.get('/:userId', authMiddleware, getUserMatch);

router.post('/add/user',authMiddleware, addUserToQueue);

export default router;
