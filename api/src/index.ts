import express from 'express';
import { envService } from './services/env.service';
import { appRouter } from './router/app.routes';
import { badPathHandler, errorHandler } from './middlewares/errors.mw';

const app = express();
const PORT = envService.vars.PORT;

app.use(express.json());
app.use(appRouter);

app.use(badPathHandler);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
