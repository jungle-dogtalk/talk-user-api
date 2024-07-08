import fs from 'fs'; // 파일 시스템 모듈 -> 파일 읽고 쓸 수 있음
import OpenAI from 'openai';
import ApiResponse from '../dto/response.js';

// OpenAI 설정
const openai = new OpenAI({
    apiKey: 'openai key 문의는 심우정에게 부탁드립니다.',
});

export const getTopicRecommendations = async (conversation) => {
    const prompt = `이게 지금까지 사람들이 대화한 스크립트야.:\n${conversation}\n 이 대화 흐름에 맞게 다음으로 이 사람들이 얘기하기 좋을만한 주제를 5가지 정도 추천해줘.`;
    console.log('AI Prompt: ', prompt);
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 200, // 생성할 최대 토큰 수
            n: 1, // 생성할 응답 개수
            temperature: 0.7, // 응답의 창의성 조정
        });

        const topicsText = response.choices[0].message.content.trim();
        const topics = topicsText
            .split('\n')
            .map((topic) => topic.trim())
            .filter((topic) => topic.length > 0);
        return ApiResponse.success({ topics });
    } catch (error) {
        console.error('Error fetching topic recommendations:', error);
        throw ApiResponse.error('주제 추천 실패', 500);
    }
};
