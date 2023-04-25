import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';

export const isLogedIn = (req: Request, res: Response, next: NextFunction) => {
  try {
    if ((req.session as any).userId) {
      console.log(req.session);
      next();
    } else {
      return res.status(403).json({ message: 'unauthorized, login first' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'something went wrong' });
  }
};

export const isAddmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.session as any).userId;
    const user = await User.findById(userId);
    if (user && user.is_admin) {
      next();
    } else {
      return res.status(403).json({ message: "unauthorized, don't have privilage" });
    }
  } catch (error) {
    return res.status(500).json({ message: 'something went wrong' });
  }
};
