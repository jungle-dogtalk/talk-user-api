import express from 'express';
import {
    createSession,
    createToken,
} from '../controllers/openviduController.js';

const router = express.Router();

router.post('/sessions', createSession);
router.post('/sessions/:sessionId/connections', createToken);

export default router;
