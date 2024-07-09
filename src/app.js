import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import openviduRoutes from './routes/openviduRoutes.js';
import errorHandler from './middlewares/errorMiddleware.js';
import matchingRoutes from './routes/matchingRoutes.js';
import audioRoutes from './routes/audioRoutes.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { clearTranscriptsForSession } from './controllers/audioController.js';

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/openvidu', openviduRoutes);
app.use('/api/match', matchingRoutes);
app.use('/api/audio', audioRoutes);

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
        console.log(`User ${socket.id} joined session ${sessionId}`);
    });

    // 세션을 떠날 때
    socket.on('leaveSession', (sessionId) => {
        if (activeUsers[sessionId]) {
            activeUsers[sessionId].delete(socket.id);
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
export { server, io };
