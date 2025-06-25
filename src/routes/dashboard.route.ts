import express from 'express';
import { authorized } from '../middleware/auth.middleware';
import { getDashboardData } from '../controllers/user.controllers';

const router = express.Router();

router.get('/', authorized, getDashboardData);

export default router;
