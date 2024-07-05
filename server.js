import app from './src/app.js';
import config from './src/config/config.js';
import connectDB from './src/config/db.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';


const startServer = async () => {
    try {
        await connectDB.connectMongo();
        await connectDB.connectRedis();
        app.listen(config.PORT, () => {
            console.log(`Server is running on port ${config.PORT}`);
        });
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
    }
};

startServer();
