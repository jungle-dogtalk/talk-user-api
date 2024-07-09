import app from './src/app.js';
import config from './src/config/config.js';
import { connectDB, connectRedis } from './src/config/db.js';
import { server } from './src/app.js';
import { createSession } from './src/services/openviduService.js';
import { io } from './src/app.js';
import { v4 as uuidv4 } from 'uuid';
import { findBestMatch } from './src/services/matchingService.js';

const userSocketMap = new Map();

const redisClient = await connectRedis.connectRedis();
const redisSub = await connectRedis.connectRedis();

redisSub.subscribe('matchmaking');
redisSub.on('message', async (channel, message) => {
    if (channel === 'matchmaking' && message === 'match') {
        const users = await redisClient.hvals('waiting_queue');
        const parsedUsers = users.map((user) => JSON.parse(user));
        console.log('parsed', parsedUsers);

        const matchedGroups = [];
        while (parsedUsers.length >= 5) {
            // 5명 이상일 때만 그룹 매칭 시작

            const user = parsedUsers.shift(); //기준이 될 유저(맨 처음 사용자)
            // console.log('기준:', user);
            const bestMatches = await findBestMatch(user, parsedUsers);

            if (bestMatches.length === 3) {
                matchedGroups.push([user, ...bestMatches]);

                for (const matchedUser of bestMatches) {
                    const index = parsedUsers.findIndex(
                        (u) => u.userId === matchedUser.userId
                    );
                    if (index > -1) {
                        parsedUsers.splice(index, 1);
                    }
                }
            } else {
                parsedUsers.unshift(user);
                break;
            }
        }

        for (const group of matchedGroups) {
            const sessionId = uuidv4();
            for (const user of group) {
                let userId = user.userId;
                // if (userId == null && user._id != null) {
                //     // userId가 null 또는 undefined일 때
                //     userId = user._id.toString();
                // }
                console.log('유저', userId);
                const socketId = userSocketMap.get(userId);
                console.log(userSocketMap);
                console.log('세션', sessionId);
                console.log('소켓', socketId);

                if (socketId) {
                    io.to(socketId).emit('matched', { sessionId });
                    await redisClient.hdel('waiting_queue', user.userId);
                }
            }
        }
        // // 큐에서 4명의 사용자 가져오기
        // const users = await redisClient.lrange('waiting_queue', -4, -1);
        // await redisClient.ltrim('waiting_queue', 0, -5);

        // // OpenVidu 세션 생성 (OpenVidu API에 맞게 구현 필요)
        // const sessionId = await createSession();

        // // 매칭된 사용자들에게 세션 ID 전송
        // // io.emit('matched', { sessionId });
        // users.forEach(userId => {
        //     const socketId = userSocketMap.get(userId);
        //     if (socketId) {
        //         io.to(socketId).emit('matched', { sessionId });
        //     }
        // });
    }
    console.log('마지막', userSocketMap);
});

const startServer = async () => {
    try {
        await connectDB.connectMongo();
        io.on('connection', (socket) => {
            socket.on('userDetails', async ({ userId, interests }) => {
                if (userSocketMap.has(userId)) {
                    console.log('이미 연결된 유저입니다.');
                    socket.disconnect();
                    return;
                }

                userSocketMap.set(userId, socket.id);
                console.log('유저소켓맵 -> ', userSocketMap);

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

                    if (queueLength % 5 === 0) {
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
