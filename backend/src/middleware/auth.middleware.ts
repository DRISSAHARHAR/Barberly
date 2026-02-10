import { Request, Response, NextFunction } from 'express';
import passport from '../config/passport';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate('jwt', { session: false }, (err: Error | null, user: unknown) => {
    if (err || !user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    (req as Request & { user?: unknown }).user = user;
    next();
  })(req, res, next);
}
