import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import openviduRoutes from './routes/openviduRoutes.js';
import errorHandler from './middlewares/errorMiddleware.js';
import matchingRoutes from './routes/matchingRoutes.js';
import audioRoutes from './routes/audioRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { OpenVidu } from 'openvidu-node-client';
import config from './config/config.js';

// OpenVidu 객체를 생성하여 OpenQVidu 서버와의 통신 설정

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'https://www.barking-talk.org'],
        mathods: ['GET', 'POST'],
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

// Error handling middleware
app.use(errorHandler);

export default app;
export { server, io, OV };
