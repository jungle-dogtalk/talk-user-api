import * as audioService from '../services/audioService.js';
import ApiResponse from '../dto/response.js';
import { io } from '../app.js';

// 세션 별 대화 내용 저장 스크립트
let sessionTranscripts = {};
// partial Script 배열 제한
const MAX_TRANSCRIPT = 5;

// 클라이언트로부터 텍스트를 받아서 저장하는 함수
export const receiveTranscript = (req, res) => {
    const { username, transcript, sessionId } = req.body;
    if (!sessionTranscripts[sessionId]) {
        sessionTranscripts[sessionId] = { full: [], partial: [] };
    }
    // full은 전체 대화 내용, patial은 주제 추천 받기 전까지의 대화내용(즉 주제 추천 받을 시 초기화)
    if (transcript) {
        const cleanedTranscript = transcript.replace(/\s+/g, ''); // 띄어쓰기 제거
        const speechLength = cleanedTranscript.length; // 사용자 발언에 대한 text 길이 계산
        sessionTranscripts[sessionId].full.push({
            username,
            transcript, // 띄어쓰기 제거하지 않은 원본 텍스트
            speechLength,
        });
        console.log(
            '주제 스크립트 배열 크기: ',
            sessionTranscripts[sessionId].partial.length
        );
        // 주제 추천 배열 제한 크기 초과시 FIFO
        if (sessionTranscripts[sessionId].partial.length >= MAX_TRANSCRIPT) {
            sessionTranscripts[sessionId].partial.shift();
        }
        sessionTranscripts[sessionId].partial.push({ username, transcript });

        console.log(
            'receiveTranscript - sessionTranscripts:',
            sessionTranscripts
        );

        console.log('주제 스크립트: ', sessionTranscripts[sessionId].partial);
        res.json(
            ApiResponse.success(
                sessionTranscripts[sessionId].partial,
                'Transcript received'
            )
        );
    } else {
        res.status(400).json(ApiResponse.error('No transcript provided'));
    }
};

// 공통 스크립트를 반환하는 함수
export const getTranscripts = (req, res) => {
    const { sessionId } = req.query;
    if (sessionId && sessionTranscripts[sessionId]) {
        res.json(
            ApiResponse.success(
                sessionTranscripts[sessionId].partial,
                'Transcripts retrieved'
            )
        );
    } else {
        res.status(404).json(ApiResponse.error('Session not found'));
    }
};

// 특정 사용자의 관심사 도출 및 전송
export const endCall = async (req, res) => {
    try {
        const { username, sessionId } = req.body;
        const sessionData = sessionTranscripts[sessionId];

        if (!sessionData) {
            console.log('No sessionData');
            return res.status(404).json(ApiResponse.error('Session not found'));
        }

        // username 별로 발언들을 모으기: reduce를 이용해 username 별 그룹화된 객체로 변환
        const transcriptsByUsername = sessionData.full.reduce((acc, item) => {
            console.log('item:', item);
            if (!acc[item.username]) {
                acc[item.username] = [];
            }
            acc[item.username].push(item);
            return acc;
        }, {});

        // 발화량 계산
        const totalLength = sessionData.full.reduce(
            (acc, item) => acc + item.speechLength,
            0
        );
        const speechPercentages = Object.keys(transcriptsByUsername).reduce(
            (acc, key) => {
                const userLength = transcriptsByUsername[key].reduce(
                    (acc, item) => acc + item.speechLength,
                    0
                );
                acc[key] = ((userLength / totalLength) * 100).toFixed(0); //소수점 반올림
                return acc;
            },
            {}
        );
        console.log(`${username}의 발화량: ${speechPercentages[username]}`);

        console.log('username별 스크립트:', transcriptsByUsername);

        // 요청한 사용자의 발언을 기반으로 관심사 도출
        const userTranscripts = transcriptsByUsername[username] || [];
        const transcriptText = userTranscripts
            .map((item) => item.transcript)
            .join('\n');
        const interests = await audioService.getInterest(
            username,
            transcriptText
        );

        console.log('Interests:', interests);

        const client = {
            username,
            interests,
            speech: speechPercentages[username],
        };

        res.json(ApiResponse.success(client, 'Call ended and interests sent.'));
    } catch (error) {
        console.error('Error ending call and fetching interests:', error);
        res.status(500).json(
            ApiResponse.error('Failed to end call', error.message)
        );
    }
};

// 주제 추천 요청을 처리하는 함수
export const recommendTopics = async (sessionId) => {
    const sessionData = sessionTranscripts[sessionId];

    if (!sessionData) {
        console.error('Session not found');
        return;
    }

    const conversation = sessionData.partial
        .map((item) => `${item.username}: ${item.transcript}`)
        .join('\n');
    console.log('대화 스크립트: ', conversation);
    try {
        await audioService.getTopicRecommendations(sessionId, conversation);
        sessionData.partial = [];
        /*------------본래 Topic 한 번에 보내던 코드-------------*/
        // const response = await audioService.getTopicRecommendations(
        //     conversation
        // );
        // // 해당 세션에 그룹되어 있는 모든 클라이언트에게 주제 추천 결과 전송
        // io.to(sessionId).emit('topicRecommendations', response);
        // sessionData.partial = []; // 주제 추천 후 partial 리스트 초기화
    } catch (error) {
        console.error('Error fetching topic recommendations:', error);
    }
};

// 모든 사용자가 나갔을 때 스크립트를 초기화하는 함수
export const clearTranscriptsForSession = (sessionId) => {
    console.log('사용자가 다 나간다면');
    if (sessionTranscripts[sessionId]) {
        delete sessionTranscripts[sessionId];
        console.log(`Transcripts for session ${sessionId} have been cleared.`);
    } else {
        console.log(`No transcripts found for session ${sessionId}`);
    }
};
