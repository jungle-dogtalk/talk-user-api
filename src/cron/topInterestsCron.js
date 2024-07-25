import cron from 'node-cron';
import User from '../models/User.js';

let topInterestsCache = [];

// cron으로 특정 시간 간격으로 특정 작업을 정기적으로 실행하도록 함
const updateTopInterests = async () => {
    try {
        const interestsAggregation = await User.aggregate([
            { $unwind: '$interests2' },
            { $group: { _id: '$interests2', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);

        topInterestsCache = interestsAggregation.map(
            (interest) => interest._id
        );
        console.log('Top interests updated:', topInterestsCache);
    } catch (error) {
        console.error('Failed to update top interests:', error);
    }
};

// 5분마다 작업을 실행하도록 스케줄
cron.schedule('*/5 * * * *', updateTopInterests);

// 서버 시작시 캐시 초기화
updateTopInterests();

export const getCachedTopInterests = () => topInterestsCache;
