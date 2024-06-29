class ApiResponse {
    constructor(data, message = "성공", code = 200) {
      this.code = code;
      this.status = code === 200;
      this.message = message;
      this.data = data;
    }
  
    static success(data, message = "성공") {
      return new ApiResponse(data, message);
    }
  
    static error(message = "실패", code = 400) {
      return new ApiResponse(null, message, code);
    }
  }
  
  module.exports = ApiResponse;