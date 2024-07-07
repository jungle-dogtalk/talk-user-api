import * as authService from '../services/authService.js'; // 인증 서비스 모듈을 가져온다.

// 회원가입 엔드포인트 핸들러
export const register = async (req, res) => {

    // Multer 미들웨어를 사용하여 파일 업로드 처리
    authService.uploadMiddleware(req, res, async (err) => {
      if (err) {
        console.error('Multer error:', err); // 파일 업로드 중 에러 로그
        return res.status(500).json({ error: err.message });
      }
  
      const { username, password, name, email, interests, nickname } = req.body;
      const profileImage = req.file;
  
      try {
        const userData = {
            username,
            password,
            name,
            email,
            interests,
            nickname,
            profileImage,
          };
        const { token, user } = await authService.register(userData);
  
        res.status(201).json({ token, user });
      } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: error.message });
      }
    });
  };

  // 로그인 엔드포인트 핸들러
  export const login = async (req, res, next) => {
    try {
        const { username, password } = req.body; // 요청 본문에서 사용자 이름과 비밀번호 추출

        // 인증 서비스의 login 함수를 호출하여 사용자 인증
        const { token, user } = await authService.login({ username, password });

        // 성공 응답 반환
        res.status(200).json({
            code: 200,
            status: true,
            message: '로그인 성공',
            data: {
                token: token,
                user: user,
            },
        });
    } catch (error) {
        console.error('Error during login:', error); // 로그인 중 에러 로그
        res.status(500).json({ error: error.message }); // 에러 응답
    }
};
