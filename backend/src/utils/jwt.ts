import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const JWT_EXPIRES_IN = '7d';

export interface JwtPayload {
  userId: number;
  email: string;
  role?: string;
  shopId?: string;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
