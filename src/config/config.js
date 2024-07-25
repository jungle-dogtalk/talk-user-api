import dotenv from 'dotenv';

dotenv.config();

const config = {
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    OPENVIDU_URL: process.env.OPENVIDU_URL,
    OPENVIDU_SECRET: process.env.OPENVIDU_SECRET,
    PYTHON_SERVER_URL: process.env.PYTHON_SERVER_URL,
    OPEN_API_KEY: process.env.OPEN_API_KEY,
    AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
    AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
};

export default config;
