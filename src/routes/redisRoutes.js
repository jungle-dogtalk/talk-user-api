import express from 'express';
import {
    addToQueue,
    publishMessage,
    subscribeToChannel,
} from '../controllers/Credis.js';

const router = express.Router();

router.post('/publish', publishMessage);
router.get('/subscribe/:channel', subscribeToChannel);
router.post('/queue', addToQueue);

export default router;
