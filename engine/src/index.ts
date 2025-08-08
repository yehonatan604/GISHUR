import dotenv from 'dotenv';
import { cache } from './infrastructure/cache.js';
import { caseService } from './services/case.service.js';

dotenv.config();

async function startEngine() {
    try {
        // Redis
        await cache.set('hello', 'world');
        const value = await cache.get('hello');
        console.log(value);
        await cache.del('hello');

        // RabbitMQ
        await caseService.initQueue(); // Initialize the case queue
        caseService.publishCase({ // Publish a sample case
            caseId: 'case-001',
            user1: '68959594ca8706a2a51b7467',
            user2: '68959594ca8706a2a51b7467',
            timestamp: Date.now(),
            sideA: {
                title: 'Vacation in Hawaii',
                arguments: [
                    'Great waves for surfing',
                    'There is a special deal with El Al',
                    'My friends are going there too'
                ]
            },
            sideB: {
                title: 'Vacation in Madagascar',
                arguments: [
                    'Less crowded and commercialized',
                    'Cheaper overall',
                    'Stable weather this season'
                ]
            }
        });
        caseService.consumeCases(); // Start consuming cases
    } catch (err) {
        console.error('❌ Engine error:', err);
    }
}

startEngine();
