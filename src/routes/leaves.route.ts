import express from 'express';
import { authorized } from '../middleware/auth.middleware';
import { allowRoles } from '../middleware/allowRoles';
import {
  createLeave,
  getStudentLeaves,
  getAllPendingLeaves,
 updateLeaveStatus
} from '../controllers/leave.controller';

const router = express.Router();

router.post('/', authorized, allowRoles('student'), createLeave);
router.get('/user', authorized, allowRoles('student'), getStudentLeaves);
router.get('/pending', authorized, allowRoles('admin', 'principal'), getAllPendingLeaves);
router.put('/:leaveId/status', authorized, allowRoles('admin', 'principal', 'teacher'), updateLeaveStatus);


export default router;
