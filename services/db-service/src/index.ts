import { db } from './infrastructure/db.js';
import { initMessageBroker } from './infrastructure/messageBroker.js';

await db.connect();
await initMessageBroker();