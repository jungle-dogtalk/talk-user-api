const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

const Response = require('./src/dto/response');

app.use(cors());  // CORS 미들웨어 사용 (TODO: CORS 정책 변경 요망 / 현재는 모든 ip에 대해 열려있음)
app.use(express.json());

// TODO: 테스트용 코드 추후 삭제 요망
function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

app.get('/', (req, res) => {
  res.send('2팀 나만무 멍톡 백엔드 API 서버');
});

// data가 1개일 경우 객체 형태로 응답하기
app.get('/test/single-data', async (req, res) => {    
  await delay(2000);  // 2초 후 응답을 보냅니다

  const data = {'id': 1, 'name': '김철수'};
  res.json(Response.success(data, "테스트 성공!"));
});

// data가 여러개일 경우 객체의 배열 형태로 응답하기
app.get('/test/multiple-data', async (req, res) => {
  await delay(2000);  // 2초 후 응답을 보냅니다

  const data = [
    {'id': 1, 'name': '김철수'},
    {'id': 2, 'name': '김영희'},
  ];

  res.json(Response.success(data, "테스트 성공!"));
});

app.get('/test/greeting', async (req, res) => {  
  const data = { 'id': 1, 'name': req.query.name };

  res.json(Response.success(data, "테스트 성공!"));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
