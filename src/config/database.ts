import mongoose from 'mongoose'
 export const MONGODB_URI = process.env.MONGODB_URI
export const connect = async ():Promise<void>=>{
    try{
          if(!MONGODB_URI){
         throw new Error('MONGODB_URI is not defined in the environment variables');
        }
        await mongoose.connect(MONGODB_URI)
        console.log("connected to Database");
        
    }catch (e){
     console.error('Database connection error:', e);
     
    }
}