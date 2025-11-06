import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

// Sanitize all string inputs to prevent XSS
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // In serverless environments, req.body and req.query may be read-only
  // So we mutate them in place instead of reassigning
  if (req.body && typeof req.body === 'object') {
    sanitizeObjectInPlace(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    sanitizeObjectInPlace(req.query);
  }
  next();
};

// Mutate object in place for serverless compatibility
const sanitizeObjectInPlace = (obj: any): void => {
  if (!obj || typeof obj !== 'object') {
    return;
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (typeof value === 'string') {
        obj[key] = xss(value);
      } else if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          if (typeof value[i] === 'string') {
            value[i] = xss(value[i]);
          } else if (typeof value[i] === 'object' && value[i] !== null) {
            sanitizeObjectInPlace(value[i]);
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        sanitizeObjectInPlace(value);
      }
    }
  }
};

const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return xss(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  return obj;
};
