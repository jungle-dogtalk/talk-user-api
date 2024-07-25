import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // User 모델을 가져옵니다.

// 요청이 인증된 사용자인지 확인.
const authMiddleware = async (req, res, next) => {

    // 토큰 추출
    const token = req.headers.authorization?.split(' ')[1]; // 헤더에서 토큰을 추출합니다.

    // 토큰 존재 여부 확인
    if (!token) {
        return res.status(401).json({ message: 'Authentication token is missing' });
    }

    // 토큰 검증 및 사용자 조회
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // 토큰을 검증합니다.
        req.user = await User.findById(decoded.id); // 토큰에서 추출한 사용자 ID로 사용자를 찾습니다.
        
        if (!req.user) {
            return res.status(401).json({ message: 'Invalid token: User not found' });
        }
        next(); // 다음 미들웨어로 이동합니다.
        
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

export default authMiddleware;
