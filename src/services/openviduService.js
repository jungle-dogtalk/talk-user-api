import axios from 'axios';

const OPENVIDU_SERVER_URL =
    process.env.OPENVIDU_SERVER_URL || 'http://localhost:4443';
const OPENVIDU_SERVER_SECRET =
    process.env.OPENVIDU_SERVER_SECRET || 'MY_SECRET';

export const createSession = async (customSessionId) => {
    const response = await axios.post(
        `${OPENVIDU_SERVER_URL}/openvidu/api/sessions`,
        { customSessionId },
        {
            headers: {
                Authorization: `Basic ${Buffer.from(
                    `OPENVIDUAPP:${OPENVIDU_SERVER_SECRET}`
                ).toString('base64')}`,
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data.id; // Return the sessionId
};

export const createToken = async (sessionId) => {
    const response = await axios.post(
        `${OPENVIDU_SERVER_URL}/openvidu/api/sessions/${sessionId}/connection`,
        {},
        {
            headers: {
                Authorization: `Basic ${Buffer.from(
                    `OPENVIDUAPP:${OPENVIDU_SERVER_SECRET}`
                ).toString('base64')}`,
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data.token; // Return the token
};
