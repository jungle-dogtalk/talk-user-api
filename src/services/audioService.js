import fs from 'fs'; // 파일 시스템 모듈 -> 파일 읽고 쓸 수 있음
import OpenAI from 'openai';
import ApiResponse from '../dto/response.js';
import User from '../models/User.js'; // 사용자 모델 가져오기
import { io } from '../app.js';
import dotenv from 'dotenv';

// OpenAI 설정
const openai = new OpenAI({
    apiKey: `${process.env.Open_API_KEY}`,
});

export const getTopicRecommendations = async (sessionId, conversation) => {
    const prompt = `이게 지금까지 사람들이 대화한 스크립트야.:\n${conversation}\n 이 대화 흐름에 맞게 이 사람들이 다음으로 얘기하기 좋을만한 주제를 3가지 정도 추천해줘. 각 주제는 줄바꿈을 사용해서 답해줘.`;

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
            io.to(sessionId).emit('topicRecommendations', message);
        }

        const endTime = Date.now();
        console.log(
            '주제 추천 응답에 걸린 시간: ',
            (endTime - startTime) / 1000,
            '초'
        );
        io.to(sessionId).emit('endOfStream');

        /*------------본래 주제 한 번에 보내던 코드-------------*/
        // const topicsText = response.choices[0].message.content.trim();
        // const topics = topicsText
        //     .split('\n')
        //     .map((topic) => topic.trim())
        //     .filter((topic) => topic.length > 0);
        // return ApiResponse.success({ topics });
    } catch (error) {
        console.error('Error fetching topic recommendations:', error);
        throw ApiResponse.error('주제 추천 실패', 500);
    }
};

export const getInterest = async (username, transcript) => {
    const prompt = `다음 대화 내용을 기반으로 이 말을 한 사람의 관심사를 5가지의 단어로 특정해줘. 각 관심사는 예를 들어 음식\n여행\n 이런 식으로 줄바꿈을 사용해서 단어로만 답해줘. 대화 내용: '${transcript}'`;
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
            .map((interest) => interest.trim())
            .filter((interest) => interest.length > 0);

        const endTime = Date.now();
        console.log(
            '관심사 요청 응답에 걸린 시간: ',
            (endTime - startTime) / 1000,
            '초'
        );
        console.log('관심사 요청 AI 반환값:', interests);

        // 사용자 DB에 관심사 업데이트
        const user = await User.findOne({ username });
        if (!user) {
            throw new Error('User not found');
        }

        // 기존 interests2 필드를 삭제하고 새로 추가
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { interests2: interests, nickname: '세글자' },
            { new: true } // 업데이트된 문서를 반환받기 위해 new: true 옵션 사용
        );
        console.log('User interests updated successfully:', updatedUser);

        return interests;
    } catch (error) {
        console.error('Error fetching interests:', error);
        throw ApiResponse.error('Failed to fetch interests', 500);
    }
};
