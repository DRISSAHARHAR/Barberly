import jwt from 'jsonwebtoken';
import { AuthTokens } from '../types';

const jwtSecret = process.env.JWT_SECRET ?? 'dev-secret';
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret';

export function generateTokens(userId: string, email: string): AuthTokens {
  const accessToken = jwt.sign({ email }, jwtSecret, {
    subject: userId,
    expiresIn: '15m'
  });

  const refreshToken = jwt.sign({ email }, jwtRefreshSecret, {
    subject: userId,
    expiresIn: '7d'
  });

  return { accessToken, refreshToken };
}
