import app from './src/app.js';
import config from './src/config/config.js';
import { connectDB, connectRedis } from './src/config/db.js';
import { server } from './src/app.js';
// import { createSession } from './src/controllers/openviduController.js';
import { createSession } from './src/services/openviduService.js';
import { io } from './src/app.js';

const userSocketMap = new Map();

const startServer = async () => {
    try {
        await connectDB.connectMongo();
        io.on('connection', (socket) => {
            const userId = socket.handshake.query.userId;
            userSocketMap.set(userId, socket.id);

            socket.on('disconnect', () => {
                userSocketMap.delete(userId);
            });

            console.log('유저아이디 -> ', userId);

            socket.join(userId);
        });

        server.listen(config.PORT, () => {
            console.log(`Server is running on port ${config.PORT}`);
        });
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
    }
};

const redisClient = await connectRedis.connectRedis();
const redisSub = await connectRedis.connectRedis();

redisSub.subscribe('matchmaking');
redisSub.on('message', async (channel, message) => {
    if (channel === 'matchmaking' && message === 'match') {
        // 큐에서 4명의 사용자 가져오기
        const users = await redisClient.lrange('waiting_queue', -4, -1);
        await redisClient.ltrim('waiting_queue', 0, -5);

        // OpenVidu 세션 생성 (OpenVidu API에 맞게 구현 필요)
        const sessionId = 'TestSessionId';
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


startServer();

export { redisClient, redisSub };
