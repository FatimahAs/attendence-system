import dotenv from 'dotenv';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from './utils/logger';
import { dev, port } from './utils/helpers';
import userRoutes from './routes/user.route';
import classRoutes from './routes/class.route';
import authRoutes from './routes/auth.routes';
import attendanceRoutes from './routes/attendance.route';
import leaveRoutes from './routes/leaves.route';
import dashboardRoutes from './routes/dashboard.route';
import { OK, INTERNAL_SERVER_ERROR} from './utils/http-status';
import { connect } from './config/database';
import { AppError } from './utils/errors';


dotenv.config();


const app: Express = express();
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173', 'https://weather-c3fd.onrender.com'];//put backend-server page url

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(helmet());
app.use(morgan('tiny', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req: Request, res: Response) => {
  res
    .status(OK)
    .json({ message: 'attendance API - Welcome!' });
});

app.use((err: Error | AppError, req: Request, res: Response, next: NextFunction): void => {
  logger.error('Error:', err.message);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(dev && { stack: err.stack })
    });
    return;
  }

  res.status(INTERNAL_SERVER_ERROR).json({
    status: 'error', 
    message: 'Something went wrong!',
    ...(dev && { error: err.message, stack: err.stack })
  });
});
const server = async ()=>{
await connect(); 
app.listen(port, () => {
  logger.info(`server is running at http://localhost:${port}`);
})
};

server()