// HTTP 상태 코드
exports.OK = 200
exports.CREATED = 201
exports.NO_CONTENT = 204

exports.BAD_REQUEST = 400
exports.UNAUTHORIZED = 401
exports.FORBIDDEN = 403
exports.NOT_FOUND = 404
exports.METHOD_NOT_ALLOWED = 405
exports.CONFLICT = 409
exports.UNPROCESSABLE_ENTITY = 422
exports.TOO_MANY_REQUESTS = 429

exports.INTERNAL_SERVER_ERROR = 500
exports.NOT_IMPLEMENTED = 501
exports.BAD_GATEWAY = 502
exports.SERVICE_UNAVAILABLE = 503

// 추가적인 커스텀 에러 코드 (필요시 알아서 추가해서 사용하기)
exports.VALIDATION_ERROR = 1000
exports.DATABASE_ERROR = 1001