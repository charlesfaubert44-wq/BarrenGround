import { JwtPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface User extends JwtPayload {}

    interface Request {
      user?: JwtPayload;
      employee?: {
        id: number;
        email: string;
        name: string;
      };
    }
  }
}

export {};
