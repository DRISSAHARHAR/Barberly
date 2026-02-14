import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import { prisma } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import bookingRoutes from './routes/booking.routes';
import userRoutes from './routes/user.routes';

const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '.env.development'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../.env.development')
];

for (const envPath of envCandidates) {
  dotenv.config({ path: envPath, override: false });
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://barber:barber_password@localhost:5432/barber_db';
}

if (!process.env.REDIS_URL) {
  process.env.REDIS_URL = 'redis://localhost:6379';
}

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

const PORT = Number(process.env.PORT || 3000);

async function start(): Promise<void> {
  await prisma.$connect();
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  });
}

void start();

async function shutdown(): Promise<void> {
  await disconnectRedis();
  await prisma.$disconnect();
}

process.on('SIGINT', () => {
  void shutdown().finally(() => process.exit(0));
});

process.on('SIGTERM', () => {
  void shutdown().finally(() => process.exit(0));
});

export default app;
