// 여기에 다양한 헬퍼 함수들을 정의할 수 있습니다.
exports.isEmail = (email) => {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
};
