import express from 'express';
import {
    receiveTranscript,
    getTranscripts,
    recommendTopics,
    endCall,
    AIreceiveTranscript,
    clearUserConversation,
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
// AI와의 대화 저장 및 응답 반환 라우트
router.post('/AIreceive-transcript', AIreceiveTranscript);
// AI와의 대화 기록 삭제 라우트
router.post('/clear-user-conversation', clearUserConversation);

export default router;
