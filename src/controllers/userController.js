import * as userService from '../services/userService.js';

// 프로필 업데이트 엔드포인트 핸들러
export const updateProfile = async (req, res) => {
    try {

        // 인증된 사용자의 ID를 req.user에서 추출
        const userId = req.user.id;

        // 파일 업로드를 처리하는 Multer 미들웨어 호출
        userService.uploadMiddleware(req, res, async (err) => {
            if (err) {

                // 파일 업로드 중 에러가 발생한 경우 로그를 남기고 500 상태 코드와 에러 메시지 반환
                console.error('Multer error:', err); // 파일 업로드 중 에러 로그
                return res.status(500).json({ error: err.message });
            }

            // 요청 본문에서 'interests' 필드 추출
            const { interests } = req.body;

            // JSON 문자열을 배열로 변환
            const parsedInterests = JSON.parse(interests); 

             // 사용자 프로필 이미지와 관심사를 업데이트하는 서비스 함수 호출
            const updatedUser = await userService.updateUserProfile(userId, req.file, parsedInterests);

            // 업데이트된 사용자 정보를 클라이언트에 반환
            res.status(200).json({ user: updatedUser });
        });
    } catch (error) {
        
        // 프로필 업데이트 중 에러가 발생한 경우 로그를 남기고 500 상태 코드와 에러 메시지 반환
        console.error('Error updating profile:', error);
        res.status(500).json({ error: error.message });
    }
};

// 사용자 정보 조회 엔드포인트 핸들러
export const getUserProfile = async (req, res) => {
    try {
        // 인증된 사용자의 ID를 req.user에서 추출
        const userId = req.user.id;

        // 사용자 정보를 조회하는 서비스 함수 호출
        const user = await userService.getUserProfile(userId);

        // 조회된 사용자 정보를 클라이언트에 반환
        res.status(200).json({ user });
    } catch (error) {
        // 사용자 정보 조회 중 에러가 발생한 경우 로그를 남기고 500 상태 코드와 에러 메시지 반환
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: error.message });
    }
};

