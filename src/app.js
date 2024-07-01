import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import openviduRoutes from './routes/openviduRoutes.js';
import errorHandler from './middlewares/errorMiddleware.js';

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/openvidu', openviduRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
