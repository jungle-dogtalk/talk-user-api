import { OpenVidu } from 'openvidu-node-client';
import config from '../config/config.js';

// OpenVidu 객체를 생성하여 OpenQVidu 서버와의 통신 설정
const OV = new OpenVidu(config.OPENVIDU_URL, config.OPENVIDU_SECRET);

// 세션 및 토큰 캐시를 위한 맵
const sessionCache = new Map(); // 세션 ID를 캐싱하기 위한 맵
const tokenCache = new Map(); // 토큰을 캐싱하기 위한 맵
const CACHE_EXPIRY_TIME = 60 * 60 * 1000; // 1시간

// 네트워크 기반으로 세션을 관리하기 위한 맵
const networkSessionMap = new Map(); // 네트워크 키를 기반으로 세션 ID를 저장


// 새로운 세션을 생성
export const createSession = async (networkKey) => {
  try {
    // 동일 네트워크의 세션이 이미 존재하는지 확인
    if (networkSessionMap.has(networkKey)) {
      const { sessionId, timestamp } = networkSessionMap.get(networkKey);
      // 세션이 만료되지 않았는지 확인
      if (Date.now() - timestamp < CACHE_EXPIRY_TIME) {
        return sessionId;
      } else {
        networkSessionMap.delete(networkKey); // 만료된 세션 삭제
      }
    }
    // 새로운 세션을 생성하고 생성된 세션 객체 반환
    const session = await OV.createSession();
    networkSessionMap.set(networkKey, { sessionId: session.sessionId, timestamp: Date.now() });
    
    return session.sessionId; // 생성된 세션의 ID 반환
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

// 주어진 세션 ID에 대한 새로운 토큰을 생성
export const createToken = async (sessionId) => {
  try {
    // 캐시에 저장된 토큰이 있는지 확인
    if (tokenCache.has(sessionId)) {
      const { token, timestamp } = tokenCache.get(sessionId);
      // 토큰이 만료되지 않았는지 확인
      if (Date.now() - timestamp < CACHE_EXPIRY_TIME) {
        return token;
      } else {
        tokenCache.delete(sessionId); // 만료된 토큰 삭제
      }
    }
    
    // 활성 세션 중에서 주어진 세션 ID와 일치하는 세션을 찾음
    const session = OV.activeSessions.find(session => session.sessionId === sessionId);
    
    // 세션을 찾지 못한 경우 에러를 발생 시킴
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // 해당 세션에 대한 새로운 연결을 생성하고, 생성된 연결 객체 반환
    const connection = await session.createConnection();
    const token = connection.token;

    // 토큰을 캐시에 저장
    tokenCache.set(sessionId, { token, timestamp: Date.now() });
    
    return token;
  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
};

// 만료된 세션 및 토큰 삭제
setInterval(() => {
  const now = Date.now(); // 현재 시간을 밀리초 단위로 가져옴

  // 만료된 세션 삭제
  networkSessionMap.forEach(({ timestamp }, networkKey) => {
    if (now - timestamp > CACHE_EXPIRY_TIME) {
      networkSessionMap.delete(networkKey);
      console.log(`Deleted expired session for network key: ${networkKey}`);
    }
  });

  // 만료된 토큰 삭제
  tokenCache.forEach(({ timestamp }, sessionId) => {
    if (now - timestamp > CACHE_EXPIRY_TIME) {
      tokenCache.delete(sessionId);
      console.log(`Deleted expired token for session ID: ${sessionId}`);
    }
  });
}, 60 * 60 * 1000); // 1시간마다 실행