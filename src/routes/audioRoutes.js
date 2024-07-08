import express from 'express';
import {
    receiveTranscript,
    getTranscripts,
    recommendTopics,
    endCall,
} from '../controllers/audioController.js';

const router = express.Router();

// 음성 인식 텍스트 받는 라우트
router.post('/receive-transcript', receiveTranscript);
// 공통 스크립트 반환 라우트
router.get('/transcripts', getTranscripts);
// 주제 추천 요청 라우트
router.post('/recommend-topics', recommendTopics);
// 통화 종료 시 관심사 특정 요청 라우트
router.post('/end-call', endCall);

export default router;
