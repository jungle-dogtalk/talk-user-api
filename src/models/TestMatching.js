import mongoose from 'mongoose';

// 테스트용 사용자 스키마 정의
const testMatchingSchema = new mongoose.Schema({
    id: { type: Number },
    interests: [String], // 관심사 필드 (배열)
    listeningIndex: { type: Number, required: true }, // 경청 지수 필드
    speakingIndex: { type: Number, required: true }, // 발화 지수 필드
});

const TestUser = mongoose.model('TestUser', testMatchingSchema, 'matches'); // 테스트용 사용자 모델 생성, 'matches' 컬렉션을 사용

export default TestUser; // 테스트용 사용자 모델을 export
