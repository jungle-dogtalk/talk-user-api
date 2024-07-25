import express from 'express';
import { getTopInterests } from '../controllers/topInterestsController.js';

const router = express.Router();

// 가장 많은 상위 5개의 관심사를 가져오는 엔드포인트
router.get('/top-interests', getTopInterests);

export default router;
