import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
    url: redisUrl
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
};

export default redisClient;
