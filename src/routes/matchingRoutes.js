import express from 'express';
import { getUserMatch, addUserToQueue } from '../controllers/Cmatching.js';
// import { addUserToQueue } from '../controllers/RmatchingController.js';
import authMiddleware from '../middlewares/authMiddleware.js';


const router = express.Router();

router.get('/:userId', authMiddleware, getUserMatch);

router.post('/add/user', authMiddleware, addUserToQueue);

export default router;
