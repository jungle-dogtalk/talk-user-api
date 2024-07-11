import ApiResponse from '../dto/response.js'; // ApiResponse 클래스 가져오기
import BadRequestError from '../errors/BadRequestError.js'; // BadRequestError 클래스 가져오기

// 에러 코드 상수 정의
const INTERNAL_SERVER_ERROR = 500;
const UNAUTHORIZED = 401;

/**
 * 에러 처리 미들웨어
 * @param {Object} error - 에러 객체
 * @param {Object} req - 요청 객체
 * @param {Object} res - 응답 객체
 * @param {Function} next - 다음 미들웨어 함수
 */
const errorHandler = (error, req, res, next) => {
    console.log('에러내용 -> ', error);

    // JWT 인증 에러 처리
    if (error.name === 'JsonWebTokenError') {
        return res
            .status(UNAUTHORIZED)
            .json(ApiResponse.error('유효하지 않은 토큰입니다.', UNAUTHORIZED));
    }

    console.log('에러 -> ', error);
    // BadRequestError 처리
    if (error instanceof BadRequestError) {
        return res.status(error.errorCode).json({
            status: false,
            type: error.type,
            errorCode: error.errorCode,
            message: error.message,
        });
    }

    // 기타 에러 처리
    return res
        .status(INTERNAL_SERVER_ERROR)
        .json(
            ApiResponse.error(
                '알 수 없는 오류가 발생하였습니다.',
                INTERNAL_SERVER_ERROR,
            ),
        );
};

export default errorHandler;
