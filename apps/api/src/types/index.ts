import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
