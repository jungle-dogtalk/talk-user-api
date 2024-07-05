import * as openviduService from '../services/openviduService.js'; // OpenVidu 서비스 모듈을 가져온다.

// 그냥 매번 새로운 세션과 토큰 생성
export const createSession = async (req, res, next) => {
  try {
      console.log('Creating session for user:', req.user);
      const sessionId = await openviduService.assignSession();
      console.log('Created session ID:', sessionId);
      res.status(200).json({ sessionId });
  } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({
          message: 'Failed to create session',
          error: error.message,
      });
  }
};

export const createToken = async (req, res, next) => {
  try {
      const { sessionId } = req.body;
      if (!sessionId) {
          return res.status(400).json({ message: 'Session ID is required' });
      }
      const token = await openviduService.createToken(sessionId);
      res.status(200).json({ token });
  } catch (error) {
      console.error('Error creating token:', error);
      res.status(500).json({
          message: 'Failed to create token',
          error: error.message,
      });
  }
};