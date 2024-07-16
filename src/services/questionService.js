// src/services/questionService.js
import Question from '../models/Question.js';

export const getRandomQuestion = async () => {

    // 데이터베이스에 저장된 전체 질문 수를 가져옴
    const count = await Question.countDocuments();

    // 질문 수를 기반으로 해서 0에서 (count - 1) 사이의 랜덤한 숫자를 생성
    const random = Math.floor(Math.random() * count);

    // 생성된 랜덤 숫자만큼 건너뛰어 질문을 하나 선택
    const question = await Question.findOne().skip(random);

    // 선택된 질문 객체를 반환
    return question;
};