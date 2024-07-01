import { OpenVidu } from 'openvidu-node-client';
import config from '../config/config.js';

// OpenVidu 객체를 생성하여 OpenQVidu 서버와의 통신 설정
const OV = new OpenVidu(config.OPENVIDU_URL, config.OPENVIDU_SECRET);

export const createSession = async () => {
  try {
    // 새로운 세션을 생성하고 생성된 세션 객체 반환
    const session = await OV.createSession();
    return session.sessionId; // 생성된 세션의 ID 반환
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

export const createToken = async (sessionId) => {
  try {
    
    // 활성 세션 중에서 주어진 세션 ID와 일치하는 세션을 찾음
    const session = OV.activeSessions.find(session => session.sessionId === sessionId);
    
    // 세션을 찾이 못한 경우 에러를 발생 시킴. 
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // 해당 세션에 대한 새로운 연결을 생성하고, 생성된 연결 객체 반환
    const connection = await session.createConnection();
    return connection.token;
  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
};
