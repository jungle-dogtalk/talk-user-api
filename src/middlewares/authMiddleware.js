import jwt from 'jsonwebtoken'; // JSON Web Token 라이브러리 가져오기
import config from '../config/config.js'; // 설정 파일 가져오기

export default (req, res, next) => {
    // 요청 헤더에서 Authorization 토큰 가져오기.
    const token = req.header('Authorization');

    // 토큰이 없으면 401 상태 코드와 메시지 반환
    if (!token)
        return res
            .status(401)
            .json({ message: 'Access denied. No token provided.' });

    try {
        // 토큰을 검증하고, 유효한 경우 decoded에 디코딩된 정보 저장.
        const decoded = jwt.verify(token, config.JWT_SECRET);

        // 디코딩된 정보를 req.user에 저장하여 다음 미들웨어를 사용할 수 있게 한다.
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};
