import mongoose from 'mongoose'; // MongoDB와 상호 작용하기 위해 mongoose를 사용
import bcrypt from 'bcryptjs'; // 비밀번호 해시화를 위해 bcryptjs를 사용

// 사용자 스키마 정의
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, // 사용자 이름 필드
    password: { type: String, required: true }, // 비밀번호 필드
    name: { type: String, required: true }, // 이름 필드
    nickname: { type: String, required: true }, // 닉네임 필드
    email: { type: String, required: true, unique: true }, // 이메일 필드
    interests: [String], // 관심사 필드 (배열)
    profileImage: { type: String, required: false }, // 프로필 이미지 URL 필드 (선택)
    profileImageId: { type: String, required: false }, // 이미지의 UUID를 저장하는 필드 (선택)
});

// 사용자 저장 전에 비밀번호 해시화
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        // 비밀번호가 수정되지 않았다면 다음 미들웨어로 이동
        return next();
    }

    const salt = await bcrypt.genSalt(10); // 솔트 생성
    this.password = await bcrypt.hash(this.password, salt); // 비밀번호 해시화
    next(); // 다음 미들웨어로 이동
});

const User = mongoose.model('User', userSchema); // 사용자 모델 생성

export default User; // 사용자 모델을 export
