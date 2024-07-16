// src/routes/questionRoutes.js
import express from 'express';
import { fetchRandomQuestion } from '../controllers/questionController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/random', authMiddleware, fetchRandomQuestion);

export default router;
