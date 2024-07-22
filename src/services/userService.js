import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'; // AWS S3 클라이언트 라이브러리 가져오기
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

import config from '../config/config.js'; // 설정 파일 가져오기
import User from '../models/User.js'; // 사용자 모델 가져오기

import { redisClient } from '../../server.js';

// S3 클라이언트 설정
const s3 = new S3Client({
    region: config.AWS_REGION,  //AWS 리전 설정
    credentials: {
        accessKeyId: config.AWS_ACCESS_KEY, // AWS 액세스 키 설정
        secretAccessKey: config.AWS_SECRET_KEY, // AWS 시크릿 키 설정
    },
});

// 파일 업로드 객체 생성 (메모리에 저장)
const upload = multer({
    storage: multer.memoryStorage(), // 메모리에 파일 저장
    limits: { fileSize: 5 * 1024 * 1024 }, // 파일 크기 제한: 5MB
});

// 파일 업로드 미들웨어 설정
export const uploadMiddleware = upload.single('profileImage');

// 파일을 S3에 업로드하는 함수
const uploadFileToS3 = async (file) => {

    // S3 업로드를 위한 파라미터 설정
    const params = {
        Bucket: config.AWS_BUCKET_NAME, // 업로드할 S3 버킷 이름
        Key: `img/${uuidv4()}-${file.originalname}`, // S3에 저장될 파일의 경로와 이름
        Body: file.buffer, // 업로드할 파일의 데이터
        ContentType: file.mimetype, // 파일의 MIME 타입
    };

    // S3에 파일 업로드를 위한 명령 생성
    const command = new PutObjectCommand(params);

    // S3에 파일 업로드 명령 전송
    const data = await s3.send(command);

    // 업로드된 파일의 URL 반환
    return `https://${config.AWS_BUCKET_NAME}.s3.${config.AWS_REGION}.amazonaws.com/${params.Key}`;
};

// 사용자 프로필을 업데이트하는 함수
export const updateUserProfile = async (userId, file, interests, mbti) => {
    try {
        let profileImageUrl = null;

        // 파일이 존재하면 S3에 업로드하고 URL을 얻음
        if (file) {
            profileImageUrl = await uploadFileToS3(file);
        }

        // 업데이트할 데이터를 저장할 객체
        const updateData = {};
        if (profileImageUrl) {
            updateData.profileImage = profileImageUrl;
        }

        // 관심사가 있으면 업데이트할 데이터에 추가
        if (interests) {
            updateData.interests = interests;
        }

        if (mbti) {
            updateData.mbti = mbti; // MBTI 추가
        }

        // 사용자의 프로필을 업데이트
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );

        // 업데이트된 사용자 정보 반환
        return updatedUser;
    } catch (error) {
        throw new Error('Error updating user profile: ' + error.message);
    }
};

// 사용자 정보를 조회하는 함수
export const getUserProfile = async (userId) => {
    try {
        // 사용자 정보를 조회
        const user = await User.findById(userId);

        // 조회된 사용자 정보를 반환
        return user;
    } catch (error) {
        throw new Error('Error fetching user profile: ' + error.message);
    }
};

// AI 관심사 조회
export const getAiInterests = async (userId) => {
    try {
        const user = await User.findById(userId).select('interests2');
        if (user && user.interests2 && user.interests2.length > 0) {
            return user.interests2[0]; // 첫 번째 값 반환
        } else {
            throw new Error('No AI interests found');
        }
    } catch (error) {
        throw new Error('Error fetching AI interests: ' + error.message);
    }
};

// 세션에 따른 유저 데이터 조회 서비스 함수
export const getSessionDataService = async (sessionId) => {
    try {
        const sessionData = await redisClient.hgetall(sessionId);
        if (!sessionData) {
            throw new Error('Session not found');
        }

        // Redis에서 가져온 데이터 파싱
        const parsedData = Object.entries(sessionData).map(([userId, data]) => {
            const parsedUserData = JSON.parse(data);
            return {
                userId,
                socketId: parsedUserData.socketId,

                userInterests: parsedUserData.userInterests, // 배열로 저장된 interests
                aiInterests: parsedUserData.aiInterests,
                nickname: parsedUserData.nickname,
                mbti: parsedUserData.mbti,
                question: parsedUserData.question,
                answer: parsedUserData.answer
            };
        });

        return parsedData;
    } catch (error) {
        console.error('Error in getSessionDataService:', error);
        throw error;
    }
};

// 통화 유저 정보 조회 서비스 함수
export const getCallUserInfoService = async (usernames) => {
    try {
        const users = await User.find({ username : { $in: usernames  } }).select('profileImage utterance nickname');
        return users;
    } catch (error) {
        console.error('Error in getCallUserInfoService:', error);
        throw error;
    }
};