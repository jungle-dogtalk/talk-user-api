import { OpenVidu } from 'openvidu-node-client';
import config from '../config/config.js';

// OpenVidu 객체를 생성하여 OpenQVidu 서버와의 통신 설정
const OV = new OpenVidu(config.OPENVIDU_URL, config.OPENVIDU_SECRET);

const sessions = [];
const MAX_USERS_PER_SESSION = 4; // 세션 당 최대 사용자 수

// 그냥 매번 새롭게 세션을 만듬
export const createSession = async () => {
  try {
      console.log('Creating new session');
      const session = await OV.createSession();
      sessions.push({ session, userCount: 0 }); // 세션 목록에 추가하고 사용자 수 초기화
      console.log('Created new session:', session.sessionId);
      return session.sessionId;
  } catch (error) {
      console.error('Error creating session:', error);
      throw error;
  }
};

// 세션 할당 (라운드 로빈 방식)
export const assignSession = async () => {
  // 사용 가능한 세션 찾기
  let session = sessions.find(s => s.userCount < MAX_USERS_PER_SESSION);
  if (!session) {
      const sessionId = await createSession(); // 세션이 없으면 새로 생성
      session = sessions.find(s => s.session.sessionId === sessionId);
  }
  session.userCount += 1; // 사용자 수 증가
  return session.session.sessionId;
};

export const createToken = async (sessionId) => {
  try {
      console.log('Creating token for sessionId:', sessionId);
      const session = OV.activeSessions.find(session => session.sessionId === sessionId);
      if (!session) {
          throw new Error(`Session not found: ${sessionId}`);
      }
      const connection = await session.createConnection();
      return connection.token;
  } catch (error) {
      console.error('Error creating token:', error);
      throw error;
  }
};