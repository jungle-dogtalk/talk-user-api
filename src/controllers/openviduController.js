import * as openviduService from '../services/openviduService.js'; // OpenVidu 서비스 모듈을 가져온다.
import { tcWrapper } from '../utils/tryCatch.js';
import ApiResponse from '../dto/response.js';

// 그냥 매번 새로운 세션과 토큰 생성
export const createSession = async (req, res, next) => {
    try {
        // console.log('Creating session for user:', req.user);
        const sessionId = await openviduService.createSession();
        // console.log('Created session ID:', sessionId);
        // return sessionId;

        res.status(200).json({
            data: sessionId,
        });

    } catch (error) {
        console.error('Error creating session:', error);

        // TOOD: 여기서 바로 반환하면 안 됨
        res.status(500).json({
            message: 'Failed to create session',
            error: error.message,
        });
    }
};

export const createToken = async (req, res, next) => {
    const { sessionId, userId } = req.body;
    if (!sessionId || !userId) {
        return res.status(400).json({ message: 'Session ID is required' });
    }
    const token = await openviduService.createToken(sessionId, userId);
    res.status(200).json({
        status: true,
        code: 200,
        data: token
    });
};

export const getSessionList = async (req, res, next) => {
    try {
        const sessionList = await openviduService.getSessions();
        res.status(200).json({ data: sessionList })
    } catch (error) {
        res.status(500).json({
            message: '세션 목록 조회 실패',
            error: error.message,
        });
    }
}

export const calculateTimer = async (req, res, next) => {
    const { sessionId } = req.query;
    const remainingTime = await openviduService.calculateTimer(sessionId);

    res.status(200).json(ApiResponse.success({ remainingTime }))
}
