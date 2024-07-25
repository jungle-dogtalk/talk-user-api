// 컨트롤러 함수를 wrapping하여 에러 핸들링
export const tcWrapper = (controller) => async (req, res, next) => {
    try {
        // wrapping된 원래 컨트롤러 함수를 실행합니다.
        // 비동기 작업을 처리하기 위해 await를 사용합니다.
        await controller(req, res);
    } catch (error) {
        // "에러 발생 시" 다음 미들웨어로 에러를 전달합니다.
        // 이를 통해 중앙 집중식 에러 처리가 가능해집니다.
        return next(error);
    }
};
