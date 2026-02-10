import { NextFunction, Request, Response } from 'express';

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction): void {
  const message = error.message || 'Internal server error';

  const knownStatusByMessage: Record<string, number> = {
    'Invalid credentials': 401,
    Unauthorized: 401,
    'Token invalide ou expiré': 401,
    'Compte invalide ou suspendu': 401,
    'Accès non autorisé': 403,
    'Utilisateur non trouvé': 404
  };

  const status = knownStatusByMessage[message] ?? 400;

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
}
