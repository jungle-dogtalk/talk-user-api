import { connectRedis } from '../config/db.js';
import { createSession, createToken } from '../services/openviduService.js';
import config from '../config/config.js';

const QUEUE_CHANNEL = 'userQueue';
const MAX_USERS_PER_SESSION = 4;

export const addToQueue = async (req, res) => {
    const user = req.body.user;
    const redisClient = await connectRedis.connectRedis();

    console.log('Adding user to queue:', user);
    await redisClient.lpush(QUEUE_CHANNEL, JSON.stringify(user));

    const queueLength = await redisClient.llen(QUEUE_CHANNEL);
    console.log('Current queue length:', queueLength);

    if (queueLength >= MAX_USERS_PER_SESSION) {
        console.log(
            'Queue length is 4 or more, publishing message to matchQueue'
        );
        redisClient.publish('matchQueue', '4 users ready');
    }

    res.status(200).json({ message: 'Added to queue' });
};

const createSessionAndNotifyUsers = async (users) => {
    try {
        console.log('Users to notify:', users);
        const sessionId = await createSession();
        console.log('Assigned session ID:', sessionId);

        const tokens = await Promise.all(
            users.map(() => createToken(sessionId))
        );
        console.log('Generated tokens:', tokens);

        users.forEach((user, index) => {
            console.log(
                `Notifying user ${user.id} with token ${tokens[index]}`
            );
        });
    } catch (error) {
        console.error('Failed to create session and notify users:', error);
    }
};

// matchQueue 채널 Setup
const setupRedisSubscriber = async () => {
    const subscriberRedisClient = await connectRedis.connectRedis();
    const commandRedisClient = await connectRedis.connectRedis();

    subscriberRedisClient.subscribe('matchQueue');
    subscriberRedisClient.on('message', async (channel, message) => {
        if (channel === 'matchQueue' && message === '4 users ready') {
            const users = [];
            console.log(
                'Received "4 users ready" message, creating session and notifying users'
            );

            for (let i = 0; i < MAX_USERS_PER_SESSION; i++) {
                const user = await commandRedisClient.rpop(QUEUE_CHANNEL);
                if (user) {
                    users.push(JSON.parse(user));
                } else {
                    console.error('Failed to retrieve user from queue');
                }
            }
            console.log(users);
            await createSessionAndNotifyUsers(users);
        }
    });
};

setupRedisSubscriber();

/************************************************************* */
export const publishMessage = async (req, res) => {
    const { channel, message } = req.body;
    try {
        const redisClient = await connectRedis.connectRedis();
        await redisClient.publish(channel, message);

        res.status(200).send('Message published successfully');
    } catch (err) {
        res.status(500).send('Error publishing message: ' + err.message);
    }
};

export const subscribeToChannel = async (req, res) => {
    const { channel } = req.params;
    try {
        const redisClient = await connectRedis.connectRedis();
        await redisClient.subscribe(channel);
        redisClient.on('message', (ch, message) => {
            if (ch === channel) {
                console.log(`Received message: ${message}`);
            }
        });
        res.status(200).send(`Subscribed to channel: ${channel}`);
    } catch (err) {
        res.status(500).send('Error subscribing to channel: ' + err.message);
    }
};
