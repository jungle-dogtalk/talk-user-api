import { OpenVidu } from 'openvidu-node-client';
import config from '../config/config.js';

// OpenVidu 객체를 생성하여 OpenQVidu 서버와의 통신 설정
const OV = new OpenVidu(config.OPENVIDU_URL, config.OPENVIDU_SECRET);

// 그냥 매번 새롭게 세션을 만듬
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