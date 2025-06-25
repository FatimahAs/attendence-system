import { Router } from "express";
import { signUp,signIn,signOut} from '../controllers/user.controllers'
import { authorized } from "../middleware/auth.middleware";
import { allowRoles } from "../middleware/allowRoles";


const router = Router()

router.post('/signup', signUp)//students only register role in signUp
router.post('/signin', signIn)
router.post('/signout',authorized, signOut)

export default router; 

