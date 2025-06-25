import { Router } from "express";
import { 
    getClassTeachers, 
    assignClassTeachers, 
    getClassStudents, 
    assignClassStudents} from '../controllers/class.controller'
import { authorized } from "../middleware/auth.middleware";
import { allowRoles } from "../middleware/allowRoles";


const router = Router()
router.get('/class/:id/teachers', getClassTeachers);
router.post('/class/:id/teachers', authorized, allowRoles('admin', 'principal'), assignClassTeachers);
router.get('/class/:id/students', authorized, getClassStudents);
router.post('/class/:id/students', authorized, allowRoles('admin', 'principal'), assignClassStudents);
export default router; 

