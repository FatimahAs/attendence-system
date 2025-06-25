import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import UserCollection  from '../models/user.model'; 
import { MONGODB_URI } from '../config/database'; 

const seedUsers = async () => {
  try {
      if(!MONGODB_URI){
         throw new Error('MONGODB_URI is not defined in the environment variables');
        }
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = [
      {
        name: 'Admin User',
        email: 'admin@email.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
      },
      {
        name: 'Principal User',
        email: 'principal@email.com',
        password: await bcrypt.hash('principal123', 10),
        role: 'principal',
      },
      {
        name: 'Teacher User',
        email: 'teacher@email.com',
        password: await bcrypt.hash('teacher123', 10),
        role: 'teacher',
      },
    ];

    for (const user of users) {
      const existing = await UserCollection.findOne({ email: user.email });
      if (!existing) {
        await UserCollection.create(user);
        console.log(`Created ${user.role} - ${user.email}`);
      } else {
        console.log(`${user.role} already exists - ${user.email}`);
      }
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (err: any) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
};

seedUsers();
