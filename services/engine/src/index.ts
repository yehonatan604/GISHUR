import { cache } from './infrastructure/cache.js';
import { initMessageBroker } from './infrastructure/messageBroker.js';

const startEngine = async () => {
    try {
        await cache.set('test', '✅ Redis Cache is Ready');
        console.log(await cache.get('test'));
        await cache.del('test');

        await initMessageBroker();
    } catch (err) {
        console.error('❌ Engine error:', err);
    }
};

startEngine();
