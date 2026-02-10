import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { AuthenticatedRequest } from '../types';

export class UserController {
  async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const user = await userService.getById(userId);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async list(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.list();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
