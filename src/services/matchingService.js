import TestUser from '../models/TestMatching.js'; // 테스트용 모델을 임포트
import User from '../models/User.js';
import axios from 'axios';
import config from '../config/config.js';
import { connectRedis } from '../config/db.js';

const calculateSimilarity = async (userA, userB) => {
    const response = await axios.post(
        `${config.PYTHON_SERVER_URL}/similarity/`,
        {
            interestsA: userA.interests,
            interestsB: userB.interests,
            // listeningA: userA.listeningIndex,
            // listeningB: userB.listeningIndex,
            // speakingA: userA.speakingIndex,
            // speakingB: userB.speakingIndex,
        }
    );
    // console.log(userA.interests);

    return response.data.similarity;
};

// const findBestMatch = async (user) => {
//     const users = await User.find();

//     // 현재 사용자를 제외한 유저 리스트
//     const otherUsers = users.filter((otherUser) => otherUser._id !== user._id);

//     // 모든 유저와의 유사도 계산 (Promise.all 사용)
//     const similarityPromises = otherUsers.map(async (otherUser) => {
//         const similarity = await calculateSimilarity(user, otherUser);
//         return { user: otherUser, similarity };
//     });

//     const similarities = await Promise.all(similarityPromises);

//     // 유사도에 따라 정렬 후 상위 3명 선택
//     similarities.sort((a, b) => b.similarity - a.similarity);
//     const bestMatches = similarities.slice(1, 4).map((entry) => entry.user);

//     console.log('Best Matches: ', bestMatches);
//     return bestMatches;
// };

const findBestMatch = async (user, parsedUsers) => {
    // 기준 사용자를 제외한 유저 리스트
    const otherUsers = parsedUsers.filter(
        (otherUser) => otherUser.userId !== user.userId
    );

    // 모든 유저와의 유사도 계산 (Promise.all 사용)
    const similarityPromises = otherUsers.map(async (otherUser) => {
        const similarity = await calculateSimilarity(user, otherUser);
        return { user: otherUser, similarity };
    });

    const similarities = await Promise.all(similarityPromises);

    // 유사도에 따라 정렬 후 상위 3명 선택
    similarities.sort((a, b) => b.similarity - a.similarity);
    const bestMatches = similarities.slice(0, 3).map((entry) => entry.user);

    console.log('Best Matches: ', bestMatches);
    return bestMatches;
};

export { calculateSimilarity, findBestMatch };
