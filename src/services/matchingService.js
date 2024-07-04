import TestUser from '../models/TestMatching.js'; // 테스트용 모델을 임포트
import axios from 'axios';
import config from '../config/config.js';

const calculateOverallSimilarity = async (userA, userB) => {
    const response = await axios.post(
        `${config.PYTHON_SERVER_URL}/similarity/`,
        {
            interestsA: userA.interests,
            interestsB: userB.interests,
            listeningA: userA.listeningIndex,
            listeningB: userB.listeningIndex,
            speakingA: userA.speakingIndex,
            speakingB: userB.speakingIndex,
        },
    );

    return response.data.similarity;
};

const findBestMatch = async (user) => {
    const users = await TestUser.find();
    let bestMatch = [];
    let highestSimilarity = 0;

    for (const otherUser of users) {
        if (otherUser._id.toString() !== user._id.toString()) {
            const similarity = await calculateOverallSimilarity(
                user,
                otherUser,
            );
            console.log(
                `User ${user._id} - User ${otherUser._id} Similarity:`,
                similarity,
            );
            if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
                bestMatch = [otherUser];
            } else if (similarity === highestSimilarity) {
                bestMatch.push(otherUser);
            }
        }
    }
    console.log('Best Matches: ', bestMatch);
    return bestMatch;
};

export { findBestMatch };
