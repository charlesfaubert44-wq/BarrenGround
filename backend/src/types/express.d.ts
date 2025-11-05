import { JwtPayload } from '../utils/jwt';
import { Shop } from '../models/Shop';

declare global {
  namespace Express {
    interface User extends JwtPayload {
      id: number;
      shopId: string; // Add shop to user payload
    }

    interface Request {
      user?: User;
      employee?: {
        id: number;
        email: string;
        name: string;
      };
      shop?: Shop; // Add shop context to request
    }
  }
}

export {};
