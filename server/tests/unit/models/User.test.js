const mongoose = require('mongoose');
const User = require('../../../src/models/User');
const { hashPassword, comparePassword } = require('../../../src/utils/auth');
const dbHandler = require('../../utils/dbHandler');

describe('User Model', () => {
  // Connect to test database before tests
  beforeAll(async () => {
    await dbHandler.connect();
  });

  // Clear database after each test
  afterEach(async () => {
    await dbHandler.clearDatabase();
  });

  // Close database connection after tests
  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  describe('User creation', () => {
    it('should create a valid user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);

      expect(user._id).toBeDefined();
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
      expect(user.role).toBe('user'); // Default role
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should hash password before saving', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);
      
      // Get user with password field
      const userWithPassword = await User.findById(user._id).select('+password');

      expect(userWithPassword.password).not.toBe(userData.password);
      expect(userWithPassword.password).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash format
    });

    it('should create user with admin role', async () => {
      const userData = {
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
      };

      const user = await User.create(userData);

      expect(user.role).toBe('admin');
    });
  });

  describe('User validation', () => {
    it('should require username', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require email', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should validate email format', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should enforce minimum username length', async () => {
      const userData = {
        username: 'ab', // Too short
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should enforce maximum username length', async () => {
      const userData = {
        username: 'a'.repeat(31), // Too long
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should enforce minimum password length', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '12345', // Too short
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should enforce unique username', async () => {
      const userData = {
        username: 'testuser',
        email: 'test1@example.com',
        password: 'password123',
      };

      await User.create(userData);

      const duplicateUser = {
        username: 'testuser', // Duplicate
        email: 'test2@example.com',
        password: 'password123',
      };

      await expect(User.create(duplicateUser)).rejects.toThrow();
    });

    it('should enforce unique email', async () => {
      const userData = {
        username: 'testuser1',
        email: 'test@example.com',
        password: 'password123',
      };

      await User.create(userData);

      const duplicateUser = {
        username: 'testuser2',
        email: 'test@example.com', // Duplicate
        password: 'password123',
      };

      await expect(User.create(duplicateUser)).rejects.toThrow();
    });

    it('should trim whitespace from username and email', async () => {
      const userData = {
        username: '  testuser  ',
        email: '  test@example.com  ',
        password: 'password123',
      };

      const user = await User.create(userData);

      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
    });

    it('should convert email to lowercase', async () => {
      const userData = {
        username: 'testuser',
        email: 'Test@Example.COM',
        password: 'password123',
      };

      const user = await User.create(userData);

      expect(user.email).toBe('test@example.com');
    });
  });

  describe('User methods', () => {
    it('should not return password in toJSON', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);
      const userJSON = user.toJSON();

      expect(userJSON.password).toBeUndefined();
      expect(userJSON.username).toBe(userData.username);
      expect(userJSON.email).toBe(userData.email);
    });

    it('should not select password by default', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const createdUser = await User.create(userData);
      const user = await User.findById(createdUser._id);

      expect(user.password).toBeUndefined();
    });

    it('should select password when explicitly requested', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const createdUser = await User.create(userData);
      const user = await User.findById(createdUser._id).select('+password');

      expect(user.password).toBeDefined();
      expect(user.password).not.toBe(userData.password);
    });
  });

  describe('Password hashing', () => {
    it('should only hash password when modified', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);
      const originalPassword = (await User.findById(user._id).select('+password')).password;

      // Update user without changing password
      user.username = 'updateduser';
      await user.save();

      const updatedUser = await User.findById(user._id).select('+password');
      expect(updatedUser.password).toBe(originalPassword);
    });

    it('should hash new password when changed', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);
      const originalPassword = (await User.findById(user._id).select('+password')).password;

      // Change password
      const userToUpdate = await User.findById(user._id).select('+password');
      userToUpdate.password = 'newpassword123';
      await userToUpdate.save();

      const updatedUser = await User.findById(user._id).select('+password');
      expect(updatedUser.password).not.toBe(originalPassword);
      expect(updatedUser.password).not.toBe('newpassword123');
    });
  });

  describe('User role', () => {
    it('should default to user role', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);

      expect(user.role).toBe('user');
    });

    it('should only allow valid roles', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'invalid-role',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });
});
