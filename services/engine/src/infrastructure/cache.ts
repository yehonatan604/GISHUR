import { createClient } from 'redis';
import { env } from '@bridgepoint/env';

const { CACHE_URL: url } = env;

const redis = createClient({ url });
redis.on('error', (err) => console.error('❌ Redis error:', err));

await redis.connect();
console.log('✅ Connected to Redis');

export { redis as cache };