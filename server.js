import app from './src/app.js';
import config from './src/config/config.js';
import { connectDB, connectRedis } from './src/config/db.js';
import { server } from './src/app.js';
// import { createSession } from './src/controllers/openviduController.js';
import { createSession } from './src/services/openviduService.js';
import { io } from './src/app.js';
import { v4 as uuidv4 } from "uuid";

const userSocketMap = new Map();

const redisClient = await connectRedis.connectRedis();
const redisSub = await connectRedis.connectRedis();

redisSub.subscribe('matchmaking');
redisSub.on('message', async (channel, message) => {
    if (channel === 'matchmaking' && message === 'match') {
        // 큐에서 4명의 사용자 가져오기
        const users = await redisClient.lrange('waiting_queue', -4, -1);
        await redisClient.ltrim('waiting_queue', 0, -5);

        // OpenVidu 세션 생성 (OpenVidu API에 맞게 구현 필요)
        const sessionId = uuidv4();
        // const sessionId = await createSession();

        // 매칭된 사용자들에게 세션 ID 전송
        // io.emit('matched', { sessionId });        
        users.forEach(userId => {
            const socketId = userSocketMap.get(userId);
            if (socketId) {
                io.to(socketId).emit('matched', { sessionId });
            }
        });
    }
});


const startServer = async () => {
    try {
        await connectDB.connectMongo();
        io.on('connection', async (socket) => {
            console.log('유저소켓맵 -> ', userSocketMap);

            const userId = socket.handshake.query.userId;
            if (userSocketMap.has(userId)) {
                console.log('이미 연결된 유저입니다.');
                socket.disconnect();
                return;
            }

            userSocketMap.set(userId, socket.id);

            // 소켓연결이 끊긴 경우
            socket.on('disconnect', async () => {
                // 대기열에 있던 유저 제거
                userSocketMap.delete(userId);
                const removedCount = await redisClient.lrem('waiting_queue', 0, userId);
            });

            console.log('유저아이디 -> ', userId);

            socket.join(userId);

            const position = await redisClient.lpos('waiting_queue', userId);
            if (position === null) {
                // userId가 큐에 없는 경우에만 추가
                const queueLength = await redisClient.lpush('waiting_queue', userId);
                console.log('대기큐 길이 -> ', queueLength);

                if (queueLength % 4 === 0) {
                    // 4명이 찼을 때 매칭 프로세스 트리거
                    redisClient.publish('matchmaking', 'match');
                }
            } else {
                console.log('유저가 이미 대기큐에 존재합니다.');
                const queueLength = await redisClient.llen('waiting_queue');
                console.log('현재 대기큐 길이 -> ', queueLength);
            }
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
