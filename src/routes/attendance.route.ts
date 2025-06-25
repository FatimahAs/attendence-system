import { Router } from "express";
import { signUp,signIn,signOut} from '../controllers/user.controllers'
import { authorized } from "../middleware/auth.middleware";


const router = Router()

router.get('/class/:id/attendance', signOut) //import from attendance controllers

router.post('/class/:id/attendance', signOut) //import from attendance controllers

export default router; 

