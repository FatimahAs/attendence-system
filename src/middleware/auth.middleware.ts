import { Request, Response, NextFunction } from 'express';
import  UserCollection  from '../models/user.model';
import {  UNAUTHORIZED, NOT_FOUND,BAD_REQUEST,OK } from '../utils/http-status';
import { verifyToken } from '../controllers/user.controllers';

export interface authRequest extends Request {
  user?: any
  headers: Request['headers']
}

export const authorized = async (
  req: authRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
      const token = req.headers.authorization?.split(' ')[1]
      if (!token){
        res.status(UNAUTHORIZED).json({message: 'invalid token'})
        return
      }
     const decoded = verifyToken(token)
     if(!decoded){
        res.status(UNAUTHORIZED).json({message: 'invalid token'})
        return}
     const user = await UserCollection.findById(decoded.id)
     if(!user){
        res.status(NOT_FOUND).json({message: 'user not found'})
        return
     }else if(user.role === 'admin'){
            const getAllUsers = await  UserCollection.find()
              res.status(OK).json({message: "all users fetched successfully", data: getAllUsers})
          }else if(user.role === 'principal'){
            const getPricipleUsers = await UserCollection.find({$or: [{role: 'teacher'},{role: 'student'}]})
            res.status(OK).json({message: 'invalid token', data: getPricipleUsers})
         }else if(user.role === 'teacher'){
             res.status(UNAUTHORIZED).json({message: 'invalid token'})
             return
         }else if(user.role === 'student'){
             res.status(UNAUTHORIZED).json({message: 'invalid token'})
             return}
     req.user = user 
     next()
  } catch (e: any) {
     res.status(BAD_REQUEST).json({message: e.message})
  }
}

