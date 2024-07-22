import fs from 'fs'; // 파일 시스템 모듈 -> 파일 읽고 쓸 수 있음
import OpenAI from 'openai';
import ApiResponse from '../dto/response.js';
import User from '../models/User.js'; // 사용자 모델 가져오기
import { io } from '../app.js';
import config from '../config/config.js';

// OpenAI 설정
const openai = new OpenAI({
    apiKey: config.OPEN_API_KEY,
});

export const getTopicRecommendations = async (sessionId, conversation) => {
    const prompt = `이게 지금까지 사람들이 대화한 스크립트야.:\n${conversation}\n
    이 대화 흐름에 맞고 사람들이 흥미로워할 만한 주제를 1개만 최대 20자 이내로 추천해줘.`;

    console.log('AI Prompt: ', prompt);
    const startTime = Date.now();
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 200, // 생성할 최대 토큰 수
            n: 1, // 생성할 응답 개수
            temperature: 0.7, // 응답의 창의성 조정
            stream: true, // 스트림 -> 응답을 한 글자씩 읽어올 수 있음
        });
        let content = '';

        for await (const chunk of response) {
            const message = chunk.choices[0].delta.content || '';
            content += message;
        }

        const endTime = Date.now();
        console.log(
            '주제 추천 응답에 걸린 시간: ',
            (endTime - startTime) / 1000,
            '초'
        );

        // ?를 제외한 특수문자 및 숫자 제거
        const topic = content.replace(/[^\w\s?가-힣]/g, '').trim();

        console.log('추천 주제: ', topic);

        io.to(sessionId).emit('topicRecommendations', topic);
        io.to(sessionId).emit('endOfStream');
    } catch (error) {
        console.error('Error fetching topic recommendations:', error);
        throw ApiResponse.error('주제 추천 실패', 500);
    }
};

export const getInterest = async (nickname, transcript) => {
    const prompt = `다음 대화 내용을 기반으로 이 말을 한 사람의 관심사를 5개의 단어로만 특정해줘.
    각 관심사는 예를 들어 '음식', '여행' 이런 식으로 의미가 있는 단어로만 답해줘. 
    문장이 아닌 단어로 말해줘.
    각 관심사는 줄바꿈을 통해 새로운 줄에서 시작하도록 해줘.
    대화 내용: '${transcript}'`;
    console.log('관심사 특정 요청: ', prompt);
    const startTime = Date.now();
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 200,
            n: 1,
            temperature: 0.7,
        });

        const interestsText = response.choices[0].message.content.trim();
        const interests = interestsText
            .split('\n')
            .map((interest) => interest.replace(/[-.,0-9]/g, '').trim()) // 하이픈, 숫자, 마침표 제거 및 트림
            .filter((interest) => interest.length > 0);

        const endTime = Date.now();
        console.log(
            '관심사 요청 응답에 걸린 시간: ',
            (endTime - startTime) / 1000,
            '초'
        );
        console.log('관심사 요청 AI 반환값:', interests);

        // 사용자 DB에 관심사 업데이트
        const user = await User.findOne({ nickname });
        if (!user) {
            throw new Error('User not found');
        }

        // 기존 interests2 필드를 삭제하고 새로 추가
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { interests2: interests },
            { new: true } // 업데이트된 문서를 반환받기 위해 new: true 옵션 사용
        );
        console.log('User interests updated successfully:', updatedUser);

        return interests;
    } catch (error) {
        console.error('Error fetching interests:', error);
        throw ApiResponse.error('Failed to fetch interests', 500);
    }
};

export const getFeedback = async (nickname, conversation) => {
    const prompt = `
    다음 대화 내용을 바탕으로 ${nickname}의 대화 스타일에 대한 피드백을 제공해줘. (대화를 잘 하는지, 잘 참여하는지, 부족한 점은 없는지 등등에 대한 분석)
    
    대화 내용:
    ${conversation}
    
    대화 내용은 언급하지 말고 피드백만 90~100글자 사이로 제공해줘.`;

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        n: 1,
        temperature: 0.7,
    });

    const feedback = response.choices[0].message.content.trim();
    console.log('AI 피드백 응답: ', feedback);

    return feedback;
};
