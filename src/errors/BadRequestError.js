const BAD_REQUEST = 400;

// BadRequestError 클래스 정의
class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.type = 'BadRequestError';
    this.errorCode = BAD_REQUEST;
  }
}

export default BadRequestError;
