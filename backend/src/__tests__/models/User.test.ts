import { UserModel } from '../../models/User';
import { getTestPool, cleanupTestData, closeTestDatabase } from '../../config/testDatabase';
import { Pool } from 'pg';

describe('User Model', () => {
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

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        email: 'newuser@test.com',
        password: 'password123',
        name: 'Test User',
      };

      const user = await UserModel.create(userData);

      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.id).toBeDefined();
      expect(user.created_at).toBeDefined();

      // Verify password was hashed
      const fullUser = await UserModel.findByEmail(userData.email);
      expect(fullUser?.password_hash).toBeDefined();
      expect(fullUser?.password_hash).not.toBe(userData.password);
    });

    it('should create user with optional phone number', async () => {
      const userData = {
        email: 'phone@test.com',
        password: 'password123',
        name: 'Phone User',
        phone: '555-0100',
      };

      const user = await UserModel.create(userData);

      expect(user.phone).toBe(userData.phone);
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'duplicate@test.com',
        password: 'password123',
        name: 'First User',
      };

      await UserModel.create(userData);

      // Try to create duplicate
      await expect(UserModel.create(userData)).rejects.toThrow();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const userData = {
        email: 'find@test.com',
        password: 'password123',
        name: 'Find Me',
      };

      await UserModel.create(userData);
      const user = await UserModel.findByEmail(userData.email);

      expect(user).not.toBeNull();
      expect(user?.email).toBe(userData.email);
      expect(user?.password_hash).toBeDefined();
    });

    it('should return null for non-existent email', async () => {
      const user = await UserModel.findByEmail('nonexistent@test.com');
      expect(user).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const userData = {
        email: 'findbyid@test.com',
        password: 'password123',
        name: 'Find By ID',
      };

      const created = await UserModel.create(userData);
      const user = await UserModel.findById(created.id);

      expect(user).not.toBeNull();
      expect(user?.id).toBe(created.id);
      expect(user?.email).toBe(userData.email);
    });

    it('should return null for non-existent id', async () => {
      const user = await UserModel.findById(999999);
      expect(user).toBeNull();
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const userData = {
        email: 'password@test.com',
        password: 'correctPassword123',
        name: 'Password User',
      };

      await UserModel.create(userData);
      const user = await UserModel.findByEmail(userData.email);

      const isValid = await UserModel.verifyPassword(
        userData.password,
        user!.password_hash!
      );

      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const userData = {
        email: 'wrongpass@test.com',
        password: 'correctPassword123',
        name: 'Password User',
      };

      await UserModel.create(userData);
      const user = await UserModel.findByEmail(userData.email);

      const isValid = await UserModel.verifyPassword(
        'wrongPassword',
        user!.password_hash!
      );

      expect(isValid).toBe(false);
    });
  });

  describe('updateProfile', () => {
    it('should update user name', async () => {
      const userData = {
        email: 'update@test.com',
        password: 'password123',
        name: 'Original Name',
      };

      const created = await UserModel.create(userData);
      const updated = await UserModel.updateProfile(created.id, {
        name: 'Updated Name',
      });

      expect(updated?.name).toBe('Updated Name');
    });

    it('should update user phone', async () => {
      const userData = {
        email: 'updatephone@test.com',
        password: 'password123',
        name: 'User',
      };

      const created = await UserModel.create(userData);
      const updated = await UserModel.updateProfile(created.id, {
        phone: '555-9999',
      });

      expect(updated?.phone).toBe('555-9999');
    });

    it('should return null for empty updates', async () => {
      const userData = {
        email: 'noupdate@test.com',
        password: 'password123',
        name: 'User',
      };

      const created = await UserModel.create(userData);
      const updated = await UserModel.updateProfile(created.id, {});

      expect(updated).toBeNull();
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const userData = {
        email: 'changepass@test.com',
        password: 'oldPassword123',
        name: 'User',
      };

      const created = await UserModel.create(userData);
      const success = await UserModel.updatePassword(created.id, 'newPassword456');

      expect(success).toBe(true);

      // Verify old password doesn't work
      const user = await UserModel.findByEmail(userData.email);
      const oldValid = await UserModel.verifyPassword(
        'oldPassword123',
        user!.password_hash!
      );
      expect(oldValid).toBe(false);

      // Verify new password works
      const newValid = await UserModel.verifyPassword(
        'newPassword456',
        user!.password_hash!
      );
      expect(newValid).toBe(true);
    });
  });

  describe('OAuth methods', () => {
    it('should create OAuth user', async () => {
      const oauthData = {
        email: 'oauth@test.com',
        name: 'OAuth User',
        oauth_provider: 'google',
        oauth_provider_id: 'google-123',
      };

      const user = await UserModel.createOAuthUser(oauthData);

      expect(user.email).toBe(oauthData.email);
      expect(user.oauth_provider).toBe(oauthData.oauth_provider);
      expect(user.oauth_provider_id).toBe(oauthData.oauth_provider_id);
    });

    it('should find user by OAuth provider', async () => {
      const oauthData = {
        email: 'findoauth@test.com',
        name: 'OAuth User',
        oauth_provider: 'google',
        oauth_provider_id: 'google-456',
      };

      await UserModel.createOAuthUser(oauthData);
      const user = await UserModel.findByOAuthProvider('google', 'google-456');

      expect(user).not.toBeNull();
      expect(user?.email).toBe(oauthData.email);
    });

    it('should find or create OAuth user - create new', async () => {
      const oauthData = {
        email: 'newgoogle@test.com',
        name: 'New Google User',
        oauth_provider: 'google',
        oauth_provider_id: 'google-789',
      };

      const user = await UserModel.findOrCreateOAuthUser(oauthData);

      expect(user.email).toBe(oauthData.email);
      expect(user.oauth_provider).toBe(oauthData.oauth_provider);
    });

    it('should find or create OAuth user - find existing', async () => {
      const oauthData = {
        email: 'existinggoogle@test.com',
        name: 'Existing User',
        oauth_provider: 'google',
        oauth_provider_id: 'google-999',
      };

      const firstUser = await UserModel.createOAuthUser(oauthData);
      const secondUser = await UserModel.findOrCreateOAuthUser(oauthData);

      expect(secondUser.id).toBe(firstUser.id);
    });

    it('should link OAuth to existing email account', async () => {
      // Create regular user
      const userData = {
        email: 'linkme@test.com',
        password: 'password123',
        name: 'Link User',
      };

      const regularUser = await UserModel.create(userData);

      // Try to create OAuth with same email
      const oauthData = {
        email: 'linkme@test.com',
        name: 'Link User',
        oauth_provider: 'google',
        oauth_provider_id: 'google-link',
      };

      const linkedUser = await UserModel.findOrCreateOAuthUser(oauthData);

      expect(linkedUser.id).toBe(regularUser.id);
      expect(linkedUser.oauth_provider).toBe('google');
    });
  });

  describe('updateLastOrder', () => {
    it('should update last order id', async () => {
      const userData = {
        email: 'lastorder@test.com',
        password: 'password123',
        name: 'User',
      };

      const user = await UserModel.create(userData);
      await UserModel.updateLastOrder(user.id, 123);

      const updated = await UserModel.findById(user.id);
      expect(updated).not.toBeNull();
    });
  });

  describe('updateStripeCustomerId', () => {
    it('should update Stripe customer ID', async () => {
      const userData = {
        email: 'stripe@test.com',
        password: 'password123',
        name: 'User',
      };

      const user = await UserModel.create(userData);
      await UserModel.updateStripeCustomerId(user.id, 'cus_test123');

      const fullUser = await UserModel.findByEmail(userData.email);
      expect(fullUser?.stripe_customer_id).toBe('cus_test123');
    });
  });
});
