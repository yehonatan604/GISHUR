import { db } from './infrastructure/db.js';
import { startConsumer } from './infrastructure/consumer.js';

await db.connect();
await startConsumer();