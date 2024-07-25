import TestUser from '../models/TestMatching.js'; // 테스트용 모델을 임포트
import { findBestMatch } from '../services/matchingService.js';
import { redisClient, redisSub } from '../../server.js';
import ApiResponse from '../dto/response.js';

const getUserMatch = async (req, res) => {
    const userId = req.params.userId;
    const user = await TestUser.findOne({ id: userId });

    //   console.log(user);

    if (!user) {
        return res.status(404).json({ msg: 'User not found' });
    }

    const bestMatch = await findBestMatch(user);

    if (!bestMatch.length) {
        return res.status(404).json({ msg: 'No suitable match found' });
    }

    res.json({ bestMatch });
};

const addUserToQueue = async (req, res) => {
    const userId = req.body.userId;
    const queueLength = await redisClient.lpush('waiting_queue', userId);

    if (queueLength % 4 === 0) {
        // 4명이 찼을 때 매칭 프로세스 트리거
        redisClient.publish('matchmaking', 'match');
    }

    return res.json(ApiResponse.success(null, userId + ' 유저 대기큐 진입'));
}

export { getUserMatch, addUserToQueue };
