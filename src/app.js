import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import openviduRoutes from './routes/openviduRoutes.js';
import errorHandler from './middlewares/errorMiddleware.js';
import matchingRoutes from './routes/matchingRoutes.js';
import audioRoutes from './routes/audioRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import topInterestsRoutes from './routes/topInterestsRoutes.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { OpenVidu } from 'openvidu-node-client';
import config from './config/config.js';
import 'dotenv/config';
import './cron/topInterestsCron.js'; // 서버 시작 시 크론 작업 설정 및 실행

// OpenVidu 객체를 생성하여 OpenQVidu 서버와의 통신 설정
import {
    clearTranscriptsForSession,
    recommendTopics,
    getSpeechLengths,
} from './controllers/audioController.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'https://www.barking-talk.org'],
        methods: ['GET', 'POST'],
    },
});

app.use(bodyParser.json());
app.use(cors());

const OV = new OpenVidu(config.OPENVIDU_URL, config.OPENVIDU_SECRET);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/openvidu', openviduRoutes);
app.use('/api/match', matchingRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/top-interests', topInterestsRoutes);

// Error handling middleware
app.use(errorHandler);

// 현재 활성화된 세션 및 사용자 목록 저장 객체
let activeUsers = {};

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);
    //세션에 참여했을 때
    socket.on('joinSession', (sessionId) => {
        if (!activeUsers[sessionId]) {
            activeUsers[sessionId] = new Set();
        }
        activeUsers[sessionId].add(socket.id);
        socket.join(sessionId); // 해당 sessionId에 들어감 (그룹화)
        console.log(`User ${socket.id} joined session ${sessionId}`);
    });

    // 세션을 떠날 때
    socket.on('leaveSession', (sessionId) => {
        if (activeUsers[sessionId]) {
            activeUsers[sessionId].delete(socket.id);
            socket.leave(sessionId); // 해당 sessionId에서 떠남
            console.log(`User ${socket.id} left session ${sessionId}`);

            if (activeUsers[sessionId].size === 0) {
                delete activeUsers[sessionId];
                // 모든 사용자가 나갔을 때 sessionTranscripts를 초기화
                clearTranscriptsForSession(sessionId);
                console.log(
                    `Session ${sessionId} has ended and transcripts have been cleared.`
                );
            }
        }
    });

    socket.on('requestSpeechLengths', (data) => {
        const { sessionId } = data;
        const sortedUsers = getSpeechLengths(sessionId);

        if (sortedUsers) {
            io.to(sessionId).emit('speechLengths', sortedUsers);
        }
    });

    // 클라이언트에서 발생한 주제 추천 요청 이벤트 수신
    socket.on('requestTopicRecommendations', (data) => {
        console.log('in request');
        const { sessionId } = data;
        recommendTopics(sessionId);
    });

    // 세션에서 연결을 끊을 때
    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
        // 모든 세션 확인 후 사용자 제거
        Object.keys(activeUsers).forEach((sessionId) => {
            if (activeUsers[sessionId].has(socket.id)) {
                activeUsers[sessionId].delete(socket.id);
                console.log(
                    `User ${socket.id} disconnected from session ${sessionId}`
                );
                console.log('현재 사용자: ', activeUsers[sessionId].size);
                if (activeUsers[sessionId].size === 0) {
                    delete activeUsers[sessionId];
                    // 모든 사용자가 나갔을 때 sessionTranscripts를 초기화
                    clearTranscriptsForSession(sessionId);
                    console.log(
                        `Session ${sessionId} has ended and transcripts have been cleared.`
                    );
                }
            }
        });
    });
});

export default app;
export { server, io, OV };
