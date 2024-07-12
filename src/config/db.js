import mongoose from 'mongoose';
import config from './config.js';
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
};
const connectRedis = {
    connectRedis: () => {
        return new Promise((resolve, reject) => {
            try {
                const redis = new Redis({
                    host: config.REDIS_HOST,
                    port: 6379,
                    password: config.REDIS_PASSWORD,
                    retryStrategy(times) {
                        const delay = Math.min(times * 50, 2000);
                        return delay;
                    }
                });

                redis.on('connect', () => {
                    console.log('Successfully connected to Redis');
                    resolve(redis);
                });

                redis.on('error', (err) => {
                    console.error('Redis connection error:', err);
                    reject(err);
                });
            } catch (err) {
                console.error('Failed to connect to Redis', err);
                reject(err);
            }
        });
    }
};

export { connectDB, connectRedis };
