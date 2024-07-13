import express from 'express';
import * as userController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// 프로필 업데이트 엔드포인트
router.patch('/profile', authMiddleware, userController.updateProfile);

// 사용자 정보 조회 엔드포인트 추가
router.get('/profile', authMiddleware, userController.getUserProfile);

// AI 관심사 조회 엔드포인트 추가
router.get('/ai-interests', authMiddleware, userController.getAiInterests);

// 세션에 따른 내부 데이터 조회 엔드포인트 추가
router.get('/session-data', authMiddleware, userController.getSessionData);

export default router;
