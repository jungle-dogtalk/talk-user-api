// import { OpenVidu } from 'openvidu-node-client';
// import config from '../config/config.js';
import { OV } from '../app.js';
import { redisClient } from '../../server.js';
import BadRequestError from '../errors/BadRequestError.js';

// OpenVidu 객체를 생성하여 OpenQVidu 서버와의 통신 설정

const MAX_USERS_PER_SESSION = 4; // 세션 당 최대 사용자 수

// OpenVidu 새로운 세션 생성
export const createSession = async () => {
  try {
    console.log('Creating new session');
    const session = await OV.createSession();
    console.log('Created new session:', session.sessionId);
    return session.sessionId;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

export const createToken = async (sid, userId) => {
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
  console.log('유저 id -> ', userId);

  const isIncludedUser = await redisClient.hexists(session.sessionId, userId);
  if (!isIncludedUser) {
    throw new BadRequestError("해당 세션에 입장할 수 없는 사용자입니다.");
  }

  const connectionProperties = {
    role: "PUBLISHER",
    data: userId,
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