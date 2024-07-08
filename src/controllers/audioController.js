import * as audioService from '../services/audioService.js';
import ApiResponse from '../dto/response.js';

let transcriptList = [];

// 클라이언트로부터 텍스트를 받아서 저장하는 함수
export const receiveTranscript = (req, res) => {
    const { connectionId, transcript } = req.body;
    if (transcript) {
        transcriptList.push({ connectionId, transcript });
        res.json(ApiResponse.success(transcriptList, 'Transcript received'));
    } else {
        res.status(400).json(ApiResponse.error('No transcript provided'));
    }
};

// 공통 스크립트를 반환하는 함수
export const getTranscripts = (req, res) => {
    res.json(ApiResponse.success(transcriptList, 'Transcripts retrieved'));
};

// 주제 추천 요청을 처리하는 함수
export const recommendTopics = async (req, res) => {
    const conversation = transcriptList
        .map((item) => `${item.connectionId}: ${item.transcript}`)
        .join('\n');
    console.log('대화 스크립트: ', conversation);
    try {
        const response = await audioService.getTopicRecommendations(
            conversation
        );
        res.json(response);
        transcriptList = [];
    } catch (error) {
        console.error('Error fetching topic recommendations:', error);
        res.status(500).json(
            ApiResponse.error(
                'Failed to fetch topic recommendations',
                error.message
            )
        );
    }
};
