import express from 'express';
import { appRouter } from './router/app.routes.js';
import { badPathHandler, errorHandler } from './middlewares/errors.mw.js';
import { initMessageBroker } from './infrastructure/messageBroker.js';
import { env } from '@bridgepoint/env';

const app = express();
const { PORT } = env;

app.use(express.json());
app.use(appRouter);
app.use(badPathHandler);
app.use(errorHandler);

(async () => {
    await initMessageBroker();

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
})();
