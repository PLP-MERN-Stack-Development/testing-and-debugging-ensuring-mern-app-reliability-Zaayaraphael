const {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
} = require('../../../src/utils/auth');
const jwt = require('jsonwebtoken');

describe('Auth Utilities', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user id and email in token payload', () => {
      const token = generateToken(mockUser);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      expect(decoded.id).toBe(mockUser._id);
      expect(decoded.email).toBe(mockUser.email);
    });

    it('should set token expiration', () => {
      const token = generateToken(mockUser);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(mockUser);
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(mockUser._id);
      expect(decoded.email).toBe(mockUser.email);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => verifyToken(invalidToken)).toThrow('Invalid token');
    });

    it('should throw error for expired token', () => {
      // Create token that expires immediately
      const expiredToken = jwt.sign(
        { id: mockUser._id, email: mockUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '0s' }
      );
      
      // Wait a bit to ensure expiration
      setTimeout(() => {
        expect(() => verifyToken(expiredToken)).toThrow();
      }, 100);
    });

    it('should throw error for token with wrong secret', () => {
      const token = jwt.sign(
        { id: mockUser._id, email: mockUser.email },
        'wrong-secret',
        { expiresIn: '1h' }
      );
      
      expect(() => verifyToken(token)).toThrow('Invalid token');
    });
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'password123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'password123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2); // bcrypt uses salt
    });

    it('should handle empty password', async () => {
      const password = '';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'password123';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(password, hash);
      
      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'password123';
      const wrongPassword = 'wrongpassword';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(wrongPassword, hash);
      
      expect(isMatch).toBe(false);
    });

    it('should be case sensitive', async () => {
      const password = 'Password123';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword('password123', hash);
      
      expect(isMatch).toBe(false);
    });

    it('should handle empty password comparison', async () => {
      const password = 'password123';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword('', hash);
      
      expect(isMatch).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should handle null user in generateToken', () => {
      expect(() => generateToken(null)).toThrow();
    });

    it('should handle undefined user in generateToken', () => {
      expect(() => generateToken(undefined)).toThrow();
    });

    it('should handle null token in verifyToken', () => {
      expect(() => verifyToken(null)).toThrow();
    });

    it('should handle empty string token in verifyToken', () => {
      expect(() => verifyToken('')).toThrow();
    });
  });
});
