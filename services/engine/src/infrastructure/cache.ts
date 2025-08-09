import { createClient } from 'redis';
import { envService } from '../services/env.service.js';

const { CACHE_URL: url } = envService.vars;

const redis = createClient({ url });
redis.on('error', (err) => console.error('❌ Redis error:', err));

await redis.connect();
console.log('✅ Connected to Redis');

export { redis as cache };