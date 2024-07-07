import {
    createSession as createSessionService,
    createToken as createTokenService,
} from '../services/openviduService.js';

export const createSession = async (req, res) => {
    try {
        const sessionId = await createSessionService(req.body.customSessionId);
        res.status(200).json(sessionId);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createToken = async (req, res) => {
    try {
        const token = await createTokenService(req.params.sessionId);
        res.status(200).json(token);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
