import mongoose from 'mongoose';
import Question from '../src/models/Question.js';
import config from '../src/config/config.js';

const questionsList = [
    "당신이 가장 좋아하는 동물은 무엇인가요?",
    "오늘 아침에 무엇을 먹었나요?",
    "가장 기억에 남는 생일 선물은 무엇인가요?",
    "어떤 종류의 책을 좋아하나요?",
    "당신의 가장 큰 두려움은 무엇인가요?",
    "어린 시절에 어떤 꿈을 꾸었나요?",
    "가장 가고 싶은 여행지는 어디인가요?",
    "당신이 가장 존경하는 사람은 누구인가요?",
    "하루 중 가장 좋아하는 시간은 언제인가요?",
    "최근에 본 영화 중 가장 좋았던 것은 무엇인가요?",
    "어떤 운동을 즐겨하나요?",
    "가장 좋아하는 스포츠 팀은 어디인가요?",
    "어떤 음악 장르를 좋아하나요?",
    "자주 가는 카페가 있나요? 있다면, 왜 그곳을 좋아하나요?",
    "당신의 버킷리스트에 있는 첫 번째 항목은 무엇인가요?",
    "가장 좋아하는 계절은 무엇인가요?",
    "가장 좋아하는 색깔은 무엇인가요?",
    "어떤 언어를 배우고 싶나요?",
    "가장 좋아하는 TV 프로그램은 무엇인가요?",
    "가장 기억에 남는 꿈은 무엇인가요?",
    "가장 좋아하는 음식은 무엇인가요?",
    "어떤 취미를 새로 시작해보고 싶나요?",
    "당신의 이상형은 어떤 사람인가요?",
    "어떤 스타일의 옷을 좋아하나요?",
    "어떤 기술을 배우고 싶나요?",
    "최근에 읽은 책 중 가장 인상 깊었던 것은 무엇인가요?",
    "어떤 종류의 예술을 좋아하나요?",
    "가장 좋아하는 명언은 무엇인가요?",
    "가장 좋아하는 과일은 무엇인가요?",
    "어떤 활동이 스트레스를 해소해주나요?",
    "당신의 하루 일과는 어떻게 되나요?",
    "가장 좋아하는 꽃은 무엇인가요?",
    "어떤 습관을 고치고 싶나요?",
    "어린 시절의 가장 행복한 기억은 무엇인가요?",
    "가장 좋아하는 음료는 무엇인가요?",
    "당신의 강아지나 고양이가 있나요?",
    "최근에 가장 행복했던 순간은 언제인가요?",
    "가장 좋아하는 과목은 무엇이었나요?",
    "가장 좋아하는 만화나 애니메이션은 무엇인가요?",
    "가장 좋아하는 간식은 무엇인가요?",
    "당신의 성격을 한 단어로 표현한다면?",
    "가장 좋아하는 노래는 무엇인가요?",
    "어떤 사람과 가장 친한가요?",
    "가장 좋아하는 패션 아이템은 무엇인가요?",
    "어떤 취미를 포기하고 싶지 않나요?",
    "가장 기억에 남는 여름 휴가는 무엇인가요?",
    "당신이 가장 사랑하는 사람은 누구인가요?",
    "가장 좋아하는 피자 토핑은 무엇인가요?",
    "가장 좋아하는 초콜릿 브랜드는 무엇인가요?",
    "당신의 생일은 언제인가요?"
];


const seedQuestions = async () => {
    try {
        await mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        await Question.deleteMany({});
        console.log('Cleared existing questions');

        for (const text of questionsList) {
            const question = new Question({ text });
            await question.save();
            console.log(`Inserted question: ${text}`);
        }

        mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error seeding questions:', error);
        mongoose.disconnect();
    }
};

seedQuestions();
