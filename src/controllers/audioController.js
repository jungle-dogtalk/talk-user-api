import * as audioService from '../services/audioService.js';
import ApiResponse from '../dto/response.js';

// 다수 인원 전체 대화 스크립트
let fullTranscriptList = [];
// 주제 추천 전까지의 대화 스크립트
let transcriptList = [];

// 클라이언트로부터 텍스트를 받아서 저장하는 함수
export const receiveTranscript = (req, res) => {
    const { username, transcript } = req.body;
    if (transcript) {
        transcriptList.push({ username, transcript });
        fullTranscriptList.push({ username, transcript });
        res.json(ApiResponse.success(transcriptList, 'Transcript received'));
    } else {
        res.status(400).json(ApiResponse.error('No transcript provided'));
    }
};

// 공통 스크립트를 반환하는 함수
export const getTranscripts = (req, res) => {
    res.json(ApiResponse.success(transcriptList, 'Transcripts retrieved'));
};

// 통화 종료 시 관심사 도출 및 각 클라이언트에 전송
export const endCall = async (req, res) => {
    try {
        const { username } = req.body;

        // username 별로 발언들을 모으기: reduce를 이용해 username 별 그룹화된 객체로 변환
        const transcriptsByUsername = fullTranscriptList.reduce((acc, item) => {
            if (!acc[item.username]) {
                acc[item.username] = [];
            }
            acc[item.username].push(item.transcript);
            return acc;
        }, {});

        console.log('username별 스크립트:', transcriptsByUsername);

        // map 함수로 각 [username, transcripts] 쌍에 대해 관심사 도출
        const interestPromises = Object.entries(transcriptsByUsername).map(
            async ([name, transcripts]) => {
                const transcriptText = transcripts.join('\n');
                const interests = await audioService.getInterest(
                    transcriptText
                );
                return { username: name, interests };
            }
        );

        const interests = await Promise.all(interestPromises);

        console.log('Interests:', interests);

        // 요청한 클라이언트의 username에 맞는 관심사만 전송
        const clientInterests = interests.find(
            (interest) => interest.username === username
        );

        if (!clientInterests) {
            return res
                .status(404)
                .json(
                    ApiResponse.error(
                        'No interests found for the provided username'
                    )
                );
        }

        res.json(
            ApiResponse.success(
                clientInterests,
                'Call ended and interests sent.'
            )
        );

        // 전체 대화 내용 초기화
        fullTranscriptList = [];
        transcriptList = [];
    } catch (error) {
        console.error('Error ending call and fetching interests:', error);
        res.status(500).json(
            ApiResponse.error('Failed to end call', error.message)
        );
    }
};

// 주제 추천 요청을 처리하는 함수
export const recommendTopics = async (req, res) => {
    const conversation = transcriptList
        .map((item) => `${item.username}: ${item.transcript}`)
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
