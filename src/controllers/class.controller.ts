import { Request, Response } from 'express';
import ClassModel from '../models/class.model';
import {BAD_REQUEST} from '../utils/http-status'
import {AppError} from '../utils/errors'
import { authRequest } from '../middleware/auth.middleware';




export const userHistory = async (req: authRequest, res: Response): Promise<void> =>{
try{
const userID = req.user.id
const getHistory = await History.find({user: userID}).populate('weather').sort({requestedAt: -1})
res.json(getHistory)
}catch (e: any){
throw new AppError(`fetch history fail error: ${e.message}`, BAD_REQUEST);
}
}