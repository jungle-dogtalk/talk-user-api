// HTTP 상태 코드
export const OK = 200;
export const CREATED = 201;
export const NO_CONTENT = 204;

export const BAD_REQUEST = 400;
export const UNAUTHORIZED = 401;
export const FORBIDDEN = 403;
export const NOT_FOUND = 404;
export const METHOD_NOT_ALLOWED = 405;
export const CONFLICT = 409;
export const UNPROCESSABLE_ENTITY = 422;
export const TOO_MANY_REQUESTS = 429;

export const INTERNAL_SERVER_ERROR = 500;
export const NOT_IMPLEMENTED = 501;
export const BAD_GATEWAY = 502;
export const SERVICE_UNAVAILABLE = 503;

// 추가적인 커스텀 에러 코드 (필요시 알아서 추가해서 사용하기)
export const VALIDATION_ERROR = 1000;
export const DATABASE_ERROR = 1001;
