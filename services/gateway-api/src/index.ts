import express from 'express';
import { appRouter } from './router/app.routes.js';
import { badPathHandler, errorHandler } from './middlewares/errors.mw.js';
import { channel } from './infrastructure/messageBroker.js';
import { env } from './env.js';

const app = express();
const { PORT } = env;

app.use(express.json());
app.use(appRouter);

app.use(badPathHandler);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(channel ? '✅ Connected to RabbitMQ' : '❌ Failed to connect to RabbitMQ');
});
