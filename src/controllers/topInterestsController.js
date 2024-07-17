import User from '../models/User.js';

export const getTopInterests = async (req, res) => {
    console.log('In getTopInterests');
    try {
        // Aggregation Pipeline 사용해 데이터 처리 및 분석
        const interestsAggregation = await User.aggregate([
            { $unwind: '$interests2' }, // interests2 배열을 각 요소 별로 분해해 개별 문서로 확장
            { $group: { _id: '$interests2', count: { $sum: 1 } } }, // 각 관심사별 그룹화 및 그룹별 문서 수 계산
            { $sort: { count: -1 } }, // 문서 수 기준으로 내림차순(-1) 정렬
            { $limit: 5 }, // 상위 5개의 관심사 선택
        ]);

        const topInterests = interestsAggregation.map(
            (interest) => interest._id
        );
        console.log('상위 관심사:', topInterests);

        res.status(200).json({ topInterests });
    } catch (error) {
        console.error('Failed to fetch top interests:', error);
        res.status(500).json({ message: 'Failed to fetch top interests' });
    }
};
