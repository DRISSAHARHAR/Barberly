import 'dotenv/config';
import express from 'express';
import passport from './config/passport';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middleware/error.middleware';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';

const app = express();

app.use(express.json());
app.use(passport.initialize());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);

app.use(errorHandler);

const port = Number(process.env.PORT ?? 4000);

async function start(): Promise<void> {
  await connectDatabase();
  await connectRedis();

  app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
  });
}

start().catch((error: Error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  await disconnectRedis();
  await disconnectDatabase();
  process.exit(0);
});

export default app;
