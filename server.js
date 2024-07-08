import app from './src/app.js';
import config from './src/config/config.js';
import { connectDB, connectRedis } from './src/config/db.js';
import { server } from './src/app.js';
import { createSession } from './src/services/openviduService.js';
import { io } from './src/app.js';
import { v4 as uuidv4 } from 'uuid';

const userSocketMap = new Map();

const redisClient = await connectRedis.connectRedis();
const redisSub = await connectRedis.connectRedis();

redisSub.subscribe('matchmaking');
redisSub.on('message', async (channel, message) => {
    if (channel === 'matchmaking' && message === 'match') {
        const users = await redisClient.hkeys('waiting_queue');
        console.log('Users from Redis:', users);

        const sessionId = uuidv4();

        users.forEach((userId) => {
            const socketId = userSocketMap.get(userId);
            // console.log(`Matching user ${userId} with socket ${socketId}`);
            if (socketId) {
                io.to(socketId).emit('matched', { sessionId });
                console.log(
                    `Emitted matched event to socket ${socketId} with sessionId ${sessionId}`
                );
                redisClient.hdel('waiting_queue', userId);
            }
        });
    }
});

const startServer = async () => {
    try {
        await connectDB.connectMongo();
        io.on('connection', (socket) => {
            socket.on('userDetails', async ({ userId, interests }) => {
                console.log('유저소켓맵 -> ', userSocketMap);

                if (userSocketMap.has(userId)) {
                    console.log('이미 연결된 유저입니다.');
                    socket.disconnect();
                    return;
                }

                userSocketMap.set(userId, socket.id);

                socket.on('disconnect', async () => {
                    userSocketMap.delete(userId);
                    await redisClient.hdel('waiting_queue', userId);
                });

                console.log('유저아이디 -> ', userId);
                console.log('관심사 -> ', interests);

                const userExists = await redisClient.hexists(
                    'waiting_queue',
                    userId
                );

                if (!userExists) {
                    const interestsList = Array.isArray(interests)
                        ? interests
                        : interests.split(',');

                    await redisClient.hset(
                        'waiting_queue',
                        userId,
                        JSON.stringify({ userId, interests: interestsList })
                    );

                    const queueLength = await redisClient.hlen('waiting_queue');
                    console.log('대기큐 길이 -> ', queueLength);

                    if (queueLength % 4 === 0) {
                        redisClient.publish('matchmaking', 'match');
                    }
                } else {
                    console.log('유저가 이미 대기큐에 존재합니다.');
                    const queueLength = await redisClient.hlen('waiting_queue');
                    console.log('현재 대기큐 길이 -> ', queueLength);
                }
            });
        });

        server.listen(config.PORT, () => {
            console.log(`Server is running on port ${config.PORT}`);
        });
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
    }
};

startServer();

export { redisClient, redisSub };
