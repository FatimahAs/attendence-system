import { Router } from "express";
import { createClasses,getClasses} from '../controllers/class.controller'
import { authorized } from "../middleware/auth.middleware";
import { allowRoles } from "../middleware/allowRoles";


const router = Router()

router.post('/',authorized,allowRoles('admin'), createClasses)
router.get('/',authorized, getClasses)

export default router; 

