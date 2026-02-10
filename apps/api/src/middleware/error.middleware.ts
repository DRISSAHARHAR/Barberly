import { Request, Response, NextFunction } from 'express';

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction): void {
  const status = error.message === 'Invalid credentials' || error.message === 'Unauthorized' ? 401 : 400;

  res.status(status).json({
    message: error.message || 'Something went wrong'
  });
}
