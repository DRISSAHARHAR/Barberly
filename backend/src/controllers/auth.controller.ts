import { UserRole } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone, email, password, role, firstName, lastName } = req.body;

      if (!phone || !email || !password || !firstName || !lastName) {
        res.status(400).json({ error: 'Tous les champs sont requis' });
        return;
      }

      const result = await authService.register({
        phone,
        email,
        password,
        role: role || UserRole.CLIENT,
        firstName,
        lastName
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, code } = req.body;
      const result = await authService.verifyOTP(userId, code);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async resendOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.body;
      const result = await authService.resendOTP(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone, password } = req.body;
      const deviceInfo = {
        device: req.headers['user-agent'],
        ipAddress: req.ip
      };

      const result = await authService.login(phone, password, deviceInfo);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);
      res.json(tokens);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await authService.logout(refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await authService.logoutAll(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone } = req.body;
      const result = await authService.forgotPassword(phone);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone, code, newPassword } = req.body;
      const result = await authService.resetPassword(phone, code, newPassword);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
