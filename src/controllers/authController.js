import * as authService from '../services/authService.js'; // 인증 서비스 모듈을 가져온다.

export const register = async (req, res, next) => {
  try {

    // 클라이언트로부터 받은 요청 본문 데이터를 사용하여 사용자 등록 수행
    const user = await authService.register(req.body);

    // 등록된 사용자 정보를 사용하여 JWT 토큰 생성
    const token = authService.generateToken(user);
    res.status(201).json({
      code: 201,
      status: true,
      message: "테스트 성공!",
      data: {
        token: token,
        user: user,
  }
    });
  } catch (error) {

    // 중복 키 오류(예: 이미 존재하는 이메일)인 경우, 400 상태 코드와 함께 에러 메시지를 반환
    if (error.code === 11000) { 
      res.status(400).json({ message: 'Email already exists' });
    } else {
      next(error);
    }
  }
};

export const login = async (req, res, next) => {
  try {
    // 클라이언트로부터 받은 로그인 정보를 사용하여 로그인 인증 수행. 
    const { token, user } = await authService.login(req.body);
    res.status(200).json({
      code: 200,
      status: true,
      message: "테스트 성공!",
      data: {
        token: token,
        user: user,
  }
    });
  } catch (error) {

    // 에러 발생 시 다음 미들웨어 넘겨 처리. 
    next(error);
  }
};
