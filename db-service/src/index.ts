import { db } from './infrastructure/db.js';
import { startConsumer } from './infrastructure/messageBroker.js';

await db.connect();
await startConsumer();