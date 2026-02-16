import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/profile', authenticate, userController.getProfile.bind(userController));
router.put('/profile', authenticate, userController.updateProfile.bind(userController));
router.post('/change-password', authenticate, userController.changePassword.bind(userController));

router.get('/barbers/search', authenticate, userController.searchBarbers.bind(userController));

router.post('/services', authenticate, authorize('BARBER'), userController.addService.bind(userController));
router.put('/services/:serviceId', authenticate, authorize('BARBER'), userController.updateService.bind(userController));
router.delete('/services/:serviceId', authenticate, authorize('BARBER'), userController.deleteService.bind(userController));
router.put('/availability', authenticate, authorize('BARBER'), userController.updateAvailability.bind(userController));
router.post('/portfolio', authenticate, authorize('BARBER'), userController.addPortfolioImage.bind(userController));

export default router;
