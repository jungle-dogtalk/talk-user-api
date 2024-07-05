import mongoose from 'mongoose';
import config from './config.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';

// const connectDB = async () => {
//     try {
//         await mongoose.connect(config.MONGODB_URI);
//         console.log('Connected to MongoDB');
//     } catch (err) {
//         console.error('Failed to connect to MongoDB', err);
//         process.exit(1); // 데이터베이스 연결 실패 시 프로세스를 종료
//     }
// };

const connectDB = {
    connectMongo: async () => {
        try {
            const mongoDB = await mongoose.connect(config.MONGODB_URI);
            console.log('Connected to MongoDB');
            return mongoDB;
        } catch (err) {
            console.error('Failed to connect to MongoDB', err);
            process.exit(1); // 데이터베이스 연결 실패 시 프로세스를 종료
        }
    },
    connectRedis: async () => {
        try {
            // TODO: 추후 관련 DB 설정값들 환경변수 쪽으로 옮기기
            const redis = new Redis({
                host: '43.203.179.236', // EC2 인스턴스의 퍼블릭 IP 주소
                port: 6379,
                password: 'namanmu',
                retryStrategy(times) {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                }
            });

            redis.on('connect', () => {
                console.log('Successfully connected to Redis');
            });

            redis.on('error', (err) => {
                console.error('Redis connection error:', err);
            });

            return redis;
        } catch (err) {
            console.error('Failed to connect to Redis', err);
            process.exit(1); // 데이터베이스 연결 실패 시 프로세스를 종료
        }
    },
}

export default connectDB;
