import { NextFunction, Request,Response } from "express";
import {AppError} from '../utils/errors'
import { CREATED, OK, BAD_REQUEST, UNAUTHORIZED} from '../utils/http-status';
import UserCollection , { UserDocument} from "../models/user.model";
import { getAllLeaves, getStudentLeaves, getLeavesForStudents } from './leave.controller';
import { getAllAttendance, getAttendanceByClassIds, getAttendanceByStudentId } from './attendance.controller';
import {fetchClassesForUser,getStudentsByClass, fetchClassTeachers} from '../services/class.service'
import  jwt  from "jsonwebtoken";
import { authRequest } from "../middleware/auth.middleware";

const signUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError("Email and password are required", BAD_REQUEST);
    }

    const existingUser = await UserCollection.findOne({ email });
    if (existingUser) {
      throw new AppError("Email already exists", BAD_REQUEST);
    }

    const user = await UserCollection.create({
      email,
      passwordHash: password,
      role: "student", //only students sign up
    });

    const { token } = await generateTokens(user);
    res.setHeader("Authorization", `Bearer ${token}`);
    res.status(CREATED).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
    });
  } catch (e: any) {
    console.error("Signup error:", e);
    next(new AppError(e.message || "Signup failed", BAD_REQUEST));
  }
};


const signIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body
     const user = await UserCollection.findOne({ email });
  if (!user) {
    throw new AppError('Invalid credentials', UNAUTHORIZED);
  }
  const isPasswordValid = await user.comparePassword(password)
  if(!isPasswordValid){
    res.status(UNAUTHORIZED).json({success: false , error: 'invalid password'})
    return
  }

  const { token } = await generateTokens(user);
    res.setHeader('Authorization', `Bearer ${token}`)
     res.status(OK).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token}})
  } catch (e) {
    next(e)
  }
}

//gets dashboard based on user role 
const getDashboardData = async (req: authRequest, res: Response): Promise<void> => {
  const user = req.user;

  try {
    let data;

    if (user.role === 'admin') {
      const teachers = await fetchClassTeachers(user);
      const principal = await getPrincipal();
      const students = await getStudentsByClass(user)
      const classes = await fetchClassesForUser(user);
      const leaves = await getAllLeaves();
      const attendance = await getAllAttendance();

      data = { teachers, principal, students, classes, leaves, attendance };

    } else if (user.role === 'principal') {
      const teachers = await fetchClassTeachers(user);
      const students = await getStudentsByClass(user)
      const classes = await fetchClassesForUser(user);
      const leaves = await getAllLeaves();
      const attendance = await getAllAttendance();

      data = { teachers, students, classes, leaves, attendance };

    } else if (user.role === 'teacher') {
      const relatedClasses = await fetchClassesForUser(user); 
      const relatedClassIds = relatedClasses.map(c => c._id);
      const leaves = await getLeavesForStudents(relatedClassIds);  
      const attendance = await getAttendanceByClassIds(relatedClassIds); 
      const students = await getStudentsByClass(user);
      const classes = relatedClasses;

      data = { classes, students, leaves, attendance };

    } else if (user.role === 'student') {
      const classes = await fetchClassesForUser(user);
      const leaves = await getStudentLeaves(user._id);
      const attendance = await getAttendanceByStudentId(user._id);
      const teachers = await fetchClassTeachers(user); 

      data = { classes, teachers, leaves, attendance };

    } else {
       res.status(403).json({ message: 'Role not authorized' });
    }

     res.status(OK).json({ status: 'success', data });

  } catch (err: any) {
     res.status(500).json({ message: 'Error fetching dashboard data', error: err.message });
  }
};

const getPrincipal = async () => {
  return await UserCollection.find({ role: 'principal' });
};

const signOut = async (req: authRequest, res: Response) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  })
  res.status(OK).json({
    status: 'success',
    message: 'Signed out successfully',
  })
}

const generateTokens = async (user: UserDocument): Promise<{ token: string}> => {
  try{
    const JWTsecret = process.env.JWT_SECRET
     if (!JWTsecret) {
    throw new Error('JWT_SECRET is not defined');
       }
    const userData = {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    } 
   const  token = jwt.sign(userData, JWTsecret, 
    {
            expiresIn: '15m',
            algorithm: 'HS256'
      })
         return {token};
        }catch(e){
           throw new Error('Token generation failed: ' + (e as Error).message);
        }
  
}

const verifyToken = (token: string): UserDocument | null => {
try{
    const JWTsecret = process.env.JWT_SECRET
     if (!JWTsecret) {
    throw new Error('JWT_SECRET is not defined');
       }
  const decoded = jwt.verify(token, JWTsecret) as UserDocument
  return decoded
}catch (e: any){
    throw new Error(e.message);
}
}


export {
  signUp,
  signIn,
  signOut,
  verifyToken,
  getDashboardData
}