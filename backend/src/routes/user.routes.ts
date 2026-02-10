import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/me', requireAuth, userController.me.bind(userController));
router.get('/', requireAuth, userController.list.bind(userController));

export default router;
