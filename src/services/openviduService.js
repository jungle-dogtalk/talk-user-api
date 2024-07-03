import { OpenVidu } from 'openvidu-node-client';
import config from '../config/config.js';

// OpenVidu 객체를 생성하여 OpenQVidu 서버와의 통신 설정
const OV = new OpenVidu(config.OPENVIDU_URL, config.OPENVIDU_SECRET);

// 세션 및 토큰 캐시를 위한 맵
const sessionCache = new Map(); // 세션 ID를 캐싱하기 위한 맵
const tokenCache = new Map(); // 토큰을 캐싱하기 위한 맵
const CACHE_EXPIRY_TIME = 60 * 60 * 1000; // 1시간

// 새로운 세션을 생성
export const createSession = async () => {
  try {

      // 세션 ID가 캐시에 있는지 확인
      const cachedSessionId = [...sessionCache.keys()].find(sessionId => Date.now() - sessionCache.get(sessionId) < CACHE_EXPIRY_TIME);
      
      if (cachedSessionId) {
        return cachedSessionId;
      }

    // 새로운 세션을 생성하고 생성된 세션 객체 반환
    const session = await OV.createSession();
    sessionCache.set(session.sessionId, Date.now()); // 캐시에 세션 ID와 현재 시간을 저장
    
    return session.sessionId; // 생성된 세션의 ID 반환
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

// 주어진 세션 ID에 대한 새로운 토큰을 생성
export const createToken = async (sessionId) => {
  try {
    
    // 활성 세션 중에서 주어진 세션 ID와 일치하는 세션을 찾음
    const session = OV.activeSessions.find(session => session.sessionId === sessionId);
    
    // 세션을 찾이 못한 경우 에러를 발생 시킴. 
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // 토큰이 캐시에 있는지 확인
    const cachedToken = tokenCache.get(sessionId);
    if (cachedToken && Date.now() - cachedToken.timestamp < CACHE_EXPIRY_TIME) {
      return cachedToken.token;
    }

    // 해당 세션에 대한 새로운 연결을 생성하고, 생성된 연결 객체 반환
    const connection = await session.createConnection();
    tokenCache.set(sessionId, { token: connection.token, timestamp: Date.now() }); // 캐시에 토큰과 현재 시간을 저장
    return connection.token;

  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
};

// 만료된 세션 및 토큰 삭제
setInterval(() => {
  const now = Date.now(); // 현재 시간을 밀리초 단위로 가져옴

  sessionCache.forEach((timestamp, sessionId) => {

    if (now - timestamp > CACHE_EXPIRY_TIME) { // 현재 시간과 세션 생성 시간을 비교하여 만료 여부 확인
      sessionCache.delete(sessionId); // 만료된 세션 ID를 캐시에서 삭제
    }
  });

  tokenCache.forEach((data, sessionId) => {

    if (now - data.timestamp > CACHE_EXPIRY_TIME) { // 현재 시간과 토큰 생성 시간을 비교하여 만료 여부 확인
      tokenCache.delete(sessionId); // 만료된 토큰을 캐시에서 삭제
    }
  });
}, 60 * 60 * 1000); // 1시간마다 실행