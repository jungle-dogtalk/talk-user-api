// 응답을 구조화하는 ApiResponse 클래스
class ApiResponse {
  /**
   * ApiResponse 인스턴스를 생성합니다.
   * @param {*} data - 응답 데이터
   * @param {string} [message="성공"] - 응답 메시지
   * @param {number} [code=200] - HTTP 상태 코드
   */
  constructor(data, message = "성공", code = 200) {
    this.code = code;
    this.status = code === 200;
    this.message = message;
    this.data = data;
  }

  /**
   * 성공 응답을 생성합니다.
   * @param {*} data - 응답 데이터
   * @param {string} [message="성공"] - 성공 메시지
   * @returns {ApiResponse} 성공 응답 객체
   */
  static success(data, message = "성공") {
    return new ApiResponse(data, message);
  }

  /**
   * 에러 응답을 생성합니다.
   * @param {string} [message="실패"] - 에러 메시지
   * @param {number} [code=500] - HTTP 에러 코드
   * @returns {ApiResponse} 에러 응답 객체
   */
  static error(message = "실패", code = 500) {
    return new ApiResponse(null, message, code);
  }
}

export default ApiResponse;
