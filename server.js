const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const OpenAI = require('openai');

const app = express();
const port = 3000;

const Response = require('./src/dto/response');
const { tryCatch } = require('./src/utils/tryCatch');
const errorHandler = require('./src/middlewares/errorMiddleware');
const BadRequestError = require('./src/errors/BadRequestError');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}.webm`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'audio/webm') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only webm audio files are allowed.'));
        }
    },
});

let text_conversation = []; // mozilla 대화 누적할 공통 스크립트
// let audio_conversation = []; // whisper STT 누적 공통 스크립트

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
    apiKey: 'sk-proj-IsiexBbYA3UdH6Iddno1T3BlbkFJ4GRSBYmIfWczJrsdr6qf',
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
/* ----------------------음성인식 및 주제 특정 관련--------------------- */
app.post(
    '/send-text',
    tryCatch((req, res) => {
        const { text } = req.body;
        text_conversation.push(text);
        console.log('누적할 텍스트: ', text);
        res.json(Response.success(null, '텍스트 누적 성공'));
    })
);

// 음성인식된 텍스트 기반 주제 추천 생성 API 엔드포인트 (음성인식 종료 버튼 누를 시)
app.post(
    '/ask-ai/title',
    tryCatch(async (req, res) => {
        const userQuery = text_conversation.join('. '); // 누적된 대화 스크립트 하나의 문장으로 합침
        console.log('누적된 대화: ', userQuery);
        const startTime = Date.now(); // ai 요청 시작 시간 기록

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            // content: gpt에게 보낼 내용
            messages: [
                {
                    role: 'user',
                    content:
                        userQuery +
                        '\n 해당 대화 맥락에서 이 다음 주제로 대화하기 좋은 주제를 추천해줄 수 있니? 다른 말 없이 5가지 정도의 주제를 선정해줘.',
                },
            ],
            max_tokens: 300, // 응답 시간 최소화를 위해 조정 가능
        });

        const answer = completion.choices[0].message.content; // AI 응답 가져오기
        const endTime = Date.now(); // ai 요청 종료 시간 기록
        console.log(`AI 응답 시간: ${(endTime - startTime) / 1000}초`); // 응답 시간 출력
        text_conversation = []; // 누적 대화 스크립트 초기화
        res.json(Response.success(answer, 'AI 응답 성공')); // 커스텀 응답 객체 사용해 응답 반환
    })
);

// 음성인식된 텍스트 기반 관심사 추천 생성 API 엔드포인트 (음성인식 종료 버튼 누를 시)
app.post(
    '/ask-ai/interest',
    tryCatch(async (req, res) => {
        const { query } = req.body; // 클라이언트
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content:
                        query +
                        '\n 해당 대화의 맥락을 기준으로 화자가 가지고 있는 관심사를 명사로 특정해서 5개만 말해줘.',
                },
            ],
            max_tokens: 300,
        });
        const answer = completion.choices[0].message.content;
        res.json(Response.success(answer, 'AI 응답 성공'));
    })
);

// 오디오 파일 업로드 및 Whisper STT 처리 엔드포인트
app.post(
    '/upload-audio',
    upload.single('file'),
    tryCatch(async (req, res) => {
        const audioPath = req.file.path;

        // 파일 정보 로그 추가
        console.log(`Received file with path: ${audioPath}`);
        console.log(`File original name: ${req.file.originalname}`);
        console.log(`File MIME type: ${req.file.mimetype}`);
        console.log(`File size: ${req.file.size} bytes`);

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(audioPath),
            model: 'whisper-1',
        });

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content:
                        transcription.text +
                        '\n 해당 대화의 맥락을 기준으로 화자가 가지고 있는 관심사를 명사로 특정해서 5개만 말해줘',
                },
            ],
            max_tokens: 300,
        });
        const answer = completion.choices[0].message.content;

        fs.unlinkSync(audioPath); // 파일 삭제
        res.json(Response.success({ text: transcription.text, answer: answer }, 'STT 성공'));
    })
);

app.use(errorHandler);

// 서버 실행 및 지정된 포트에서 요청 듣기
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
