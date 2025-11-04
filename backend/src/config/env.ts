import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  FRONTEND_URL: string;
  EMPLOYEE_DASHBOARD_URL: string;
}

const validateEnv = (): EnvConfig => {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'FRONTEND_URL',
    'EMPLOYEE_DASHBOARD_URL'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate JWT_SECRET is not default
  if (process.env.JWT_SECRET === 'your-secret-key-change-in-production') {
    throw new Error('JWT_SECRET must be changed from default value');
  }

  // Validate JWT_SECRET length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }

  return {
    PORT: parseInt(process.env.PORT || '5000'),
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
    FRONTEND_URL: process.env.FRONTEND_URL!,
    EMPLOYEE_DASHBOARD_URL: process.env.EMPLOYEE_DASHBOARD_URL!,
  };
};

export const env = validateEnv();
