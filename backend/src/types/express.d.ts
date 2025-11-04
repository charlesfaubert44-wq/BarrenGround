import { JwtPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface User extends JwtPayload {
      id: number;
    }

    interface Request {
      user?: User;
      employee?: {
        id: number;
        email: string;
        name: string;
      };
    }
  }
}

export {};
