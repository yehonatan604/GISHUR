import { initMessageBroker } from './infrastructure/messageBroker.js';

const start = async () => {
    try {
        console.log('🚀 Starting MailService...');
        await initMessageBroker();
        console.log('✅ MailService is running');
    } catch (err) {
        console.error('❌ Failed to start MailService:', err);
        process.exit(1);
    }
};

start();