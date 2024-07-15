import User from '../models/User.js';

const ratingToPoints = {
    1: 20,
    2: 40,
    3: 60,
    4: 80,
    5: 100,
};

export const submitReview = async (sessionId, reviews) => {
    try {
        for (const review of reviews) {
            const { username, rating } = review;
            const user = await User.findOne({ username });

            if (user) {
                const points = ratingToPoints[rating] || 0;

                // 총 리뷰 점수 및 총 리뷰 수 업데이트
                user.totalReviewScore += points;
                user.totalReviewCount += 1;

                // 새로운 평균 점수 계산
                const newAveragePoints = Math.round(user.totalReviewScore / user.totalReviewCount);

                // 최종 평균 점수 업데이트
                user.reviewAverageScore = newAveragePoints;

                await user.save();
            }
        }
    } catch (error) {
        console.error('Error in reviewService:', error);
        throw error;
    }
};

export default { submitReview };










