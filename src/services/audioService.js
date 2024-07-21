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
    이 대화 흐름에 맞게 이 사람들이 다음으로 얘기하기 좋을만한 주제를 3가지 정도 최대 20자 이내로 추천해줘. 
    각 주제는 새로운 줄에서 시작하도록 하고, 각 항목을 숫자와 점으로 시작해줘.`;

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

        // 주제 내용을 줄바꿈을 기준으로 나누어서 전송
        const topics = content
            .split('\n')
            .filter((topic) => topic.trim().length > 0);
        topics.forEach((topic) => {
            io.to(sessionId).emit('topicRecommendations', topic);
        });

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
    const prompt = `다음 대화 내용을 기반으로 이 말을 한 사람의 관심사를 5개의 단어로만 특정해줘.
    각 관심사는 예를 들어 '음식', '여행' 이런 식으로 의미가 있는 단어로만 답해줘. 
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
        const user = await User.findOne({ username });
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

export const getFeedback = async (username, conversation) => {
    const prompt = `
    1. 다음 대화에서 얘기하고 있는 것들을 총 5가지의 키워드로 추출해줘.
    2. 1번에서 뽑아온 각 키워드들에서 다음에 추가적으로 이야기하면 좋을 주제 또는 콘텐츠를 추천해줘.
    3. 대화 내용을 바탕으로 ${username}의 대화 스타일에 대한 피드백을 제공해줘. (대화를 잘 하는지, 잘 참여하는지, 부족한 점은 없는지 등등에 대한 분석)
    
    대화 내용:
    ${conversation}`;

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
    });

    // 응답 전체를 로그로 출력하여 형식을 확인
    console.log('OpenAI API response:', response);

    if (!response.choices || response.choices.length === 0) {
        throw new Error('No choices found in the response');
    }

    const feedback = response.choices[0].message.content.trim();

    // 피드백을 섹션으로 분리하기 전에 전체 피드백을 로그로 출력
    console.log('Feedback content:', feedback);

    const sections = feedback.split('\n\n');
    if (sections.length < 3) {
        throw new Error('Unexpected format of feedback');
    }

    const [keywordsSection, topicsSection, userFeedbackSection] = sections;

    const keywords = keywordsSection.split('\n');
    const recommendedTopics = topicsSection.split('\n');
    const userFeedback = userFeedbackSection;

    return { keywords, recommendedTopics, userFeedback };
};
