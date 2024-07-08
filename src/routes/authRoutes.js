import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// 사용자가 로그인 할 때 호출. authController의 login 함수를 사용하여 사용자 인증 처리.
router.post('/login', authController.login);

// 사용자가 회원가입 할 때 호출. authController의 register 함수를 사용하여 새로운 사용자 등록
router.post('/signup', authController.register);

// 아이디 중복 검사 엔드포인트
router.post('/check-username', authController.checkUsername);


export default router; // 라우터를 모듈로 내보내기.
