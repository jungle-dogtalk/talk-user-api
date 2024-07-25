import express from 'express';
import * as reviewController  from '../controllers/reviewController.js';

const router = express.Router();

router.post('/submit', reviewController.submitReview);

export default router;
