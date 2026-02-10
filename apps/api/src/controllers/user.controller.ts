import { NextFunction, Request, Response } from 'express';
import { userService } from '../services/user.service';

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const profile = await userService.getProfile(userId);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const role = req.user!.role;

      let result;
      if (role === 'BARBER') {
        result = await userService.updateBarberProfile(userId, req.body);
      } else {
        result = await userService.updateClientProfile(userId, req.body);
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async addService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const barberId = req.user!.userId;
      const service = await userService.addService(barberId, req.body);
      res.status(201).json(service);
    } catch (error) {
      next(error);
    }
  }

  async updateService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { serviceId } = req.params;
      const barberId = req.user!.userId;
      const service = await userService.updateService(serviceId, barberId, req.body);
      res.json(service);
    } catch (error) {
      next(error);
    }
  }

  async deleteService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { serviceId } = req.params;
      const barberId = req.user!.userId;
      const result = await userService.deleteService(serviceId, barberId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const barberId = req.user!.userId;
      const { availabilities } = req.body;
      const result = await userService.updateAvailability(barberId, availabilities);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async addPortfolioImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const barberId = req.user!.userId;
      const { imageUrl, caption } = req.body;
      const image = await userService.addPortfolioImage(barberId, imageUrl, caption);
      res.status(201).json(image);
    } catch (error) {
      next(error);
    }
  }

  async searchBarbers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = req.query;
      const parsedFilters = {
        lat: filters.lat ? Number(filters.lat) : undefined,
        lng: filters.lng ? Number(filters.lng) : undefined,
        radius: filters.radius ? Number(filters.radius) : undefined,
        city: typeof filters.city === 'string' ? filters.city : undefined,
        minRating: filters.minRating ? Number(filters.minRating) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        service: typeof filters.service === 'string' ? filters.service : undefined
      };

      const barbers = await userService.searchBarbers(parsedFilters);
      res.json(barbers);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = req.body;
      const result = await userService.changePassword(userId, currentPassword, newPassword);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
