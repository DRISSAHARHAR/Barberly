import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/database';
import { TokenPayload, verifyAccessToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token manquant' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { status: true }
    });

    if (!user || user.status !== 'ACTIVE') {
      res.status(401).json({ error: 'Compte invalide ou suspendu' });
      return;
    }

    req.user = payload;
    next();
  } catch (_error) {
    res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Accès non autorisé' });
      return;
    }

    next();
  };
};
