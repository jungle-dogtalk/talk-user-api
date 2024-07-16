// src/controllers/questionController.js
import { getRandomQuestion } from '../services/questionService.js';

export const fetchRandomQuestion = async (req, res) => {
    try {

        // 서비스 계층에서 랜덤한 질문을 가져옴
        const question = await getRandomQuestion();

        // 성공적으로 질문을 가져온 경우, 200 상태 코드와 함께 질문을 JSON 형식으로 응답
        res.status(200).json(question);
    } catch (error) {

        // 질문을 가져오는 도중 오류가 발생한 경우, 500 상태 코드와 함께 오류 메시지를 JSON 형식으로 응답
        res.status(500).json({ error: 'Failed to fetch question' });
    }
};
