import dotenv from "dotenv";

dotenv.config();

const config = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  OPENVIDU_URL: process.env.OPENVIDU_URL,
  OPENVIDU_SECRET: process.env.OPENVIDU_SECRET,
};

export default config;
