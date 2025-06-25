import { Router } from "express";
import { signUp,signIn,signOut} from '../controllers/user.controllers'
import { authorized } from "../middleware/auth.middleware";


const router = Router()
router.get('/class/:id/teachers', signOut)// only admin principle can get teachers in a class
router.post('/class/:id/teachers', signOut)// only admin principle can post students in a class
router.get('/class/:id/teachers', signOut)// only admin principle and class related teacher can get students in a class
router.post('/class/:id/students', signOut)// only admin principle can post students in a class
export default router; 

