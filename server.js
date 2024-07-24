import app from './src/app.js';
import config from './src/config/config.js';
import { connectDB, connectRedis } from './src/config/db.js';
import { server } from './src/app.js';
import { createSession } from './src/services/openviduService.js';
import { io } from './src/app.js';
import { findBestMatch } from './src/services/matchingService.js';

const MATCH_MAKING_PERSON_NUMBERS = 4;
const BEST_MATCHING_PERSON_NUMBERS = 3;
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
        while (parsedUsers.length >= MATCH_MAKING_PERSON_NUMBERS) {
            // 5명 이상일 때만 그룹 매칭 시작

            const user = parsedUsers.shift(); //기준이 될 유저(맨 처음 사용자)

            // console.log('기준:', user);
            const bestMatches = await findBestMatch(user, parsedUsers);

            if (bestMatches.length === BEST_MATCHING_PERSON_NUMBERS) {
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
            const sessionId = await createSession();
            for (const user of group) {
                let userId = user.userId;
                console.log('유저정보 -> ', user);
                const socketId = userSocketMap.get(userId);
                console.log(userSocketMap);
                console.log('세션', sessionId);
                console.log('소켓', socketId);

                if (socketId) {
                    io.to(socketId).emit('matched', { sessionId });
                    await redisClient.hset(
                        sessionId,
                        userId,
                        JSON.stringify({
                            socketId: socketId,
                            userInterests: user.userInterests,
                            aiInterests: user.aiInterests,
                            nickname: user.nickname,
                            mbti: user.mbti,
                            question: user.question,
                            answer: user.answer,
                        })
                    );
                    await redisClient.hdel('waiting_queue', user.userId);
                }
            }
        }
        // 대기 큐 길이 업데이트를 모든 클라이언트에 전송
        const queueLength = await redisClient.hlen('waiting_queue');
        io.emit('queueLengthUpdate', queueLength);
    }

    console.log('마지막', userSocketMap);
});

const startServer = async () => {
    try {
        await connectDB.connectMongo();
        io.on('connection', (socket) => {
            socket.on(
                'userDetails',
                async ({
                    userId,
                    userInterests,
                    aiInterests,
                    nickname,
                    mbti,
                    question,
                    answer,
                }) => {
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

                        // 유저가 대기 큐에서 삭제된 후 대기 큐 길이 업데이트 전송
                        const queueLength = await redisClient.hlen(
                            'waiting_queue'
                        );
                        io.emit('queueLengthUpdate', queueLength);
                    });

                    console.log('유저아이디 -> ', userId);
                    console.log('관심사 -> ', userInterests);

                    const userExists = await redisClient.hexists(
                        'waiting_queue',
                        userId
                    );

                    if (!userExists) {
                        const userInterestsList = Array.isArray(userInterests)
                            ? userInterests
                            : userInterests.split(',');

                        const aiInterestsList = Array.isArray(aiInterests)
                            ? aiInterests
                            : aiInterests.split(',');

                        await redisClient.hset(
                            'waiting_queue',
                            userId,
                            JSON.stringify({
                                userId,
                                userInterests: userInterestsList,
                                aiInterests: aiInterestsList,
                                nickname,
                                mbti,
                                question,
                                answer,
                            })
                        );

                        const queueLength = await redisClient.hlen(
                            'waiting_queue'
                        );
                        console.log('대기큐 길이 -> ', queueLength);

                        if (queueLength % MATCH_MAKING_PERSON_NUMBERS === 0) {
                            redisClient.publish('matchmaking', 'match');
                        }

                        //새로운 유저가 대기 큐에 추가된 후 대기 큐 길이 업데이트 전송
                        io.emit('queueLengthUpdate', queueLength);
                    } else {
                        console.log('유저가 이미 대기큐에 존재합니다.');
                        const queueLength = await redisClient.hlen(
                            'waiting_queue'
                        );
                        console.log('현재 대기큐 길이 -> ', queueLength);

                        //대기 큐 길이 전송
                        io.emit('queueLengthUpdate', queueLength);
                    }
                }
            );
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
