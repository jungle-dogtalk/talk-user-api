const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

const Response = require('./src/dto/response');
const { tryCatch } = require('./src/utils/tryCatch');
const errorHandler = require('./src/middlewares/errorMiddleware');
const BadRequestError = require('./src/errors/BadRequestError');
const OpenAI = require('openai');

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
    apiKey: 'sk-proj-39bA7taZJJXdrGgnVYwZT3BlbkFJ1VyynGCO4t0XeJLDC14S',
});

app.use(cors()); // CORS 미들웨어 사용 (TODO: CORS 정책 변경 요망 / 현재는 모든 ip에 대해 열려있음)
app.use(express.json());

// TODO: 테스트용 코드 추후 삭제 요망
function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

app.get('/', (req, res) => {
    res.send('2팀 나만무 멍톡 백엔드 API 서버입니다.');
});

// data가 하나일 경우 객체 형태로 응답하기
app.get(
    '/test/single-data',
    tryCatch(async (req, res) => {
        await delay(2000); // 2초 후 응답을 보냅니다

        const data = { id: 1, name: '김철수' };
        res.json(Response.success(data, '테스트 성공!'));
    })
);

// data가 여러개일 경우 객체의 배열 형태로 응답하기
app.get(
    '/test/multiple-data',
    tryCatch(async (req, res) => {
        await delay(2000); // 2초 후 응답을 보냅니다

        const data = [
            { id: 1, name: '김철수' },
            { id: 2, name: '김영희' },
        ];

        res.json(Response.success(data, '테스트 성공!'));
    })
);

app.get(
    '/test/greeting',
    tryCatch(async (req, res) => {
        const data = { id: 1, name: req.query.name };

        res.json(Response.success(data, '테스트 성공!'));
    })
);

// 에러핸들링 테스트용
app.get(
    '/test/error-handling',
    tryCatch(async (req, res) => {
        const validateUserPassword = (password) => {
            if (password.length < 20) {
                // 패스워드 길이는 20자 이상이어야 함
                return false;
            }
            return true;
        };

        const invalidPassword = 'PWLengthLessThan20';
        const validPassword = 'PassowrdLengthGreaterThanTwenty';

        const isValid = validateUserPassword(invalidPassword);
        if (!isValid) {
            throw new BadRequestError('비밀번호는 20자 이상이어야 합니다.');
        }

        res.json(Response.success(null, '테스트 성공'));
    })
);

// 음성인식된 텍스트 기반 답변 생성 API 엔드포인트
app.post('/ask-ai', async (req, res) => {
    const userQuery = req.body.query; // 요청 본문에서 음성인식된 텍스트 가져오기
    console.log(userQuery);
    try {
        const startTime = Date.now(); // ai 요청 시작 시간 기록

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            // content: gpt에게 보낼 내용
            messages: [
                {
                    role: 'user',
                    content:
                        userQuery +
                        '\n 해당 대화 흐름에 따른 자세한 주제를 추천해줘. 다른 말 없이 정말 딱 주제만 5가지 정도.',
                },
            ],
            max_tokens: 300, // 응답 시간 최소화를 위해 조정 가능
        });

        const answer = completion.choices[0].message.content; // AI 응답 가져오기
        const endTime = Date.now(); // ai 요청 종료 시간 기록
        console.log(`AI 응답 시간: ${endTime - startTime}초`); // 응답 시간 출력
        res.json(Response.success(answer, 'AI 응답 성공')); // 커스텀 응답 객체 사용해 응답 반환
    } catch (error) {
        console.error(error);
        res.json(Response.error('AI 응답 실패'));
    }
});

app.use(errorHandler);

// 서버 실행 및 지정된 포트에서 요청 듣기
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
