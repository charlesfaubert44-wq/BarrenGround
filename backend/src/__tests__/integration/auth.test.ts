import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/authRoutes';
import { getTestPool, cleanupTestData, closeTestDatabase } from '../../config/testDatabase';
import { Pool } from 'pg';
import { UserModel } from '../../models/User';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth API Integration Tests', () => {
  let testPool: Pool;

  beforeAll(async () => {
    testPool = getTestPool();
  });

  afterAll(async () => {
    await cleanupTestData(testPool);
    await closeTestDatabase(testPool);
  });

  afterEach(async () => {
    await cleanupTestData(testPool);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@test.com',
          password: 'password123',
          name: 'New User',
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('newuser@test.com');
      expect(response.body.user.name).toBe('New User');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.password_hash).toBeUndefined();
    });

    it('should register user with phone number', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'phoneuser@test.com',
          password: 'password123',
          name: 'Phone User',
          phone: '555-0100',
        });

      expect(response.status).toBe(201);
      expect(response.body.user.phone).toBe('555-0100');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should return 400 for short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          password: '123',
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });

    it('should return 409 for duplicate email', async () => {
      const userData = {
        email: 'duplicate@test.com',
        password: 'password123',
        name: 'First User',
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await UserModel.create({
        email: 'logintest@test.com',
        password: 'correctPassword123',
        name: 'Login Test User',
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@test.com',
          password: 'correctPassword123',
        });

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('logintest@test.com');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.password_hash).toBeUndefined();
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@test.com',
          password: 'wrongPassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auth/profile', () => {
    let authToken: string;
    let userId: number;

    beforeEach(async () => {
      // Register and login a user
      const user = await UserModel.create({
        email: 'profile@test.com',
        password: 'password123',
        name: 'Profile User',
      });
      userId = user.id;

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'profile@test.com',
          password: 'password123',
        });

      authToken = loginResponse.body.token;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('profile@test.com');
      expect(response.body.user.id).toBe(userId);
    });

    it('should return 401 without authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
    });

    it('should return 403 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(403);
    });

    it('should return 401 with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'InvalidFormat');

      expect(response.status).toBe(401);
    });
  });
});
