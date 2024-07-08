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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/openvidu', openviduRoutes);
app.use('/api/match', matchingRoutes);
app.use('/api/audio', audioRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
export { server, io };
