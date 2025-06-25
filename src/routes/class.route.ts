import { Router } from "express";
import { signUp,signIn,signOut} from '../controllers/user.controllers'
import { authorized } from "../middleware/auth.middleware";


const router = Router()

router.post('/class',authorized, signUp)// for admin only import CreateClass from class controller
router.get('/class',authorized, signIn)// for admin and princeple read all classes 
//student and teacher read related classes 
router.get('/class/:id/attendance', signOut) // get attendance routes to get class attendance

router.post('/class/:id/attendance', signOut) //only teacher post attendance for class

router.get('/class/:id/teachers', signOut)// only admin principle and class related teacher can get students in a class
router.post('/class/:id/teachers', signOut)// only admin principle can post students in a class

router.get('/class/:id/students', signOut)// only admin principle and class related teacher can get students in a class
router.post('/class/:id/students', signOut)// only admin principle can post students in a class
export default router; 

