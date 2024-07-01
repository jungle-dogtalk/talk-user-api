import * as openviduService from '../services/openviduService.js'; // OpenVidu 서비스 모듈을 가져온다.

export const createSession = async (req, res, next) => {
  try {
    // OpenVidu 서비스의 createSession 메서드를 호출하여 세션을 생성한다. 
    const sessionId = await openviduService.createSession();

    // 세션 생성이 성공하면 세션 ID를 포함한 JSON 응답 반환
    res.status(200).json({ sessionId });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ message: 'Failed to create session', error: error.message });
  }
};

export const createToken = async (req, res, next) => {
  try {
    
    // 요청 본문에서 sessionID를 가져온다.
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    // OpenVidu 서비스의 createToken 메서드를 호출하여 토큰 생성.
    const token = await openviduService.createToken(sessionId);

    // 토큰 생성이 성공되면 토큰을 포함한 JSON 응답 반환
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error creating token:', error);
    res.status(500).json({ message: 'Failed to create token', error: error.message });
  }
};
