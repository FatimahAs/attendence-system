import { NextFunction, Request,Response } from "express";
import {AppError} from '../utils/errors'
import { CREATED, OK, BAD_REQUEST, UNAUTHORIZED} from '../utils/http-status';
import UserCollection , { UserDocument} from "../models/user.model";
import  jwt  from "jsonwebtoken";
//must manually create admin account 
const signUp = async (req: Request, res: Response, next: NextFunction) =>{
    try{
        const {email, password} = req.body
        const existingUser = await UserCollection.findOne({ email })
        if(!existingUser?.email){
        throw new AppError('Email is required', BAD_REQUEST) }
        if (existingUser) {
        throw new AppError('Email already exists', BAD_REQUEST) }
        const user = await UserCollection.create({email, passwordHash: password});
        await user.save()
        const { token } = await generateTokens(user);

        res.setHeader('Authorization', `Bearer ${token}`)
         res.status(CREATED).json({
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

    }catch (e: any){
      console.error('Signup error:', e)
      throw new AppError('message', e.message) }
}

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

const signOut = async (req: Request, res: Response) => {
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
  verifyToken
}