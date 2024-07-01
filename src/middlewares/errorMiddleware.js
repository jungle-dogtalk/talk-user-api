const Response = require('../dto/response');
const BadRequestError = require("../errors/BadRequestError");
const { INTERNAL_SERVER_ERROR, UNAUTHORIZED } = require('../constants/errorCodes');

const errorHandler = (error, req, res, next) => {
  console.log('에러내용 -> ', error);

  // JWT authentication error
  if (error.name === 'JsonWebTokenError') {
    return res.status(UNAUTHORIZED).json({      
      type: error.name,
      errorCode: UNAUTHORIZED,
      message: '유효하지 않은 토큰입니다.'
    });
  }

  if (error instanceof BadRequestError) {
    return res.status(error.errorCode).json({
      type: error.type,
      errorCode: error.errorCode,
      message: error.message
    });
  }

  return res.json(Response.error("알 수 없는 오류가 발생하였습니다.", INTERNAL_SERVER_ERROR));
};

module.exports = errorHandler;