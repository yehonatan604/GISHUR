import { db } from './infrastructure/db.js';
import { startConsumer } from './broker/consumer.js';

await db.connect();
await startConsumer();