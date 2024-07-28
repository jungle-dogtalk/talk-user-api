// import { OpenVidu } from 'openvidu-node-client';
// import config from '../config/config.js';
import { OV } from '../app.js';
import { redisClient } from '../../server.js';
import BadRequestError from '../errors/BadRequestError.js';

// OpenVidu 객체를 생성하여 OpenQVidu 서버와의 통신 설정

const ALLOCATED_TIME_FOR_SESSION = (1000 * 60 * 5) + 5000;  // 5분 5초

// OpenVidu 새로운 세션 생성
export const createSession = async () => {
  try {
    console.log('Creating new session');
    const session = await OV.createSession();
    const sessionId = session.sessionId;

    if (sessionId) {
      const finishTime = Date.now() + 5 * 60 * 1000; // 현재 시각 + 5분 
      // redis 세션에 대한 메타정보 삽입 (타이머)
      await redisClient.hset(
        sessionId + '_meta',
        'finishTime',
        finishTime.toString()
      );
      setTimeout(() => {
        destorySession(sessionId);
      }, ALLOCATED_TIME_FOR_SESSION);
    }

    return sessionId;
  } catch (error) {
    console.error('세션 핸들링 도중 에러가 발생하였습니다.', error);
    throw error;
  }
};

export const createToken = async (sid, userInfo) => {
  console.log('Creating token for sessionId:', sid);
  const sessions = await OV.fetch();
  console.log('가용 세션 리스트? -> ', sessions); // 단순 fetch 메소드로는 조회가 안 됨
  // console.log('액티브 세션? -> ', OV.activeSessions);

  const session = OV.activeSessions.find(
    (s) => s.sessionId === sid
  );

  if (!session) {
    throw new Error(`Session not found: ${sid}`);
  }

  console.log('세션 id -> ', session.sessionId);
  console.log('유저 id -> ', userInfo.username);

  const userId = userInfo.username;

  const isIncludedUser = await redisClient.hexists(session.sessionId, userId);
  if (!isIncludedUser) {
    throw new BadRequestError("해당 세션에 입장할 수 없는 사용자입니다.");
  }

  const connectionProperties = {
    role: "PUBLISHER",
    data: JSON.stringify({
      nickname: userInfo.nickname,
      userId: userId,
    }),
    kurentoOptions: {
      allowedFilters: ["GStreamerFilter", "FaceOverlayFilter"]
    }
  };

  const connection = await session.createConnection(connectionProperties);
  return connection.token;
};

export const getSessions = async () => {
  try {
    const sessions = await OV.fetch();
    return sessions;
  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
}

export const calculateTimer = async (sessionId) => {
  if (!sessionId) {
    throw new BadRequestError('세션 id 누락 오류'); // TODO: 잘못된 세션 ID에 대한 예외처리도 필요
  }

  const metaData = await redisClient.hgetall(sessionId + '_meta');
  const { finishTime } = metaData;

  if (!finishTime) {
    return 0;
  }

  const finishTimeMs = parseInt(finishTime, 10);
  const currentTimeMs = Date.now();
  const remainingTimeMs = finishTimeMs - currentTimeMs;
  const remainingTimeSeconds = Math.floor(remainingTimeMs / 1000);

  return Math.max(remainingTimeSeconds, 0);
}

// 시간초과에 의한 세션 종료
const destorySession = async (sessionId) => {
  const session = OV.activeSessions.find(s => s.sessionId === sessionId);
  if (session) {
    await session.close();
  }


}