import { Request, Response, NextFunction } from 'express';
import { UNAUTHORIZED } from '../utils/http-status';

interface AuthenticatedRequest extends Request {
  user?: {
    role: string;
  };
}

export const allowRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user?.role) {
      res.status(UNAUTHORIZED).json({ message: 'User not authenticated' });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(UNAUTHORIZED).json({ message: 'You do not have permission to access this resource' });
      return;
    }

    next();
  };
};
