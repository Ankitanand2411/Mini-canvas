import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

const origins = env.CLIENT_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);

app.use(helmet());
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: '2mb' }));
if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
