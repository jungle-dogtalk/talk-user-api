import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export const register = async ({ username, password, name, email, interests }) => {

  // 새로운 사용자 객체를 생성
  const user = new User({ username, password, name, email, interests });

  // 사용자를 데이터베이스에 저장.
  await user.save();

  // 사용자 정보를 기반으로 JWT 토큰 생성
  const token = generateToken(user);
  return { token, user };
};

export const login = async ({ username, password }) => {

  // DB에 사용자 이름으로 사용자 찾기.
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error('Invalid username or password'); // 사용자가 존재하지 않을 경우 에러 발생
  }

  // 입력된 비밀번호와 저장된 비밀번호 비교
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid username or password');
  }

  const token = generateToken(user); // 로그인 시 토큰 생성
  return { token, user };
};

export const generateToken = (user) => {
  
  // 사용자 정보를 페이로드에 포함하여 JWT 토큰 생성
  return jwt.sign({ id: user._id, username: user.username, name: user.name, email: user.email }, config.JWT_SECRET, { expiresIn: '1h' });
};
