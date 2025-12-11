const { protect, authorize } = require('../../../src/middleware/auth');
const { generateToken } = require('../../../src/utils/auth');
const User = require('../../../src/models/User');

// Mock User model
jest.mock('../../../src/models/User');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks before each test
    req = {
      headers: {},
      user: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    
    User.findById = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('protect middleware', () => {
    const mockUser = {
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      username: 'testuser',
      role: 'user',
    };

    it('should authenticate user with valid token', async () => {
      const token = generateToken(mockUser);
      req.headers.authorization = `Bearer ${token}`;
      
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await protect(req, res, next);

      expect(User.findById).toHaveBeenCalledWith(mockUser._id);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject request without authorization header', async () => {
      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Not authorized to access this route',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token format', async () => {
      req.headers.authorization = 'InvalidFormat token123';

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Not authorized to access this route',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', async () => {
      req.headers.authorization = 'Bearer invalid.token.here';

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Not authorized to access this route',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request when user not found', async () => {
      const token = generateToken(mockUser);
      req.headers.authorization = `Bearer ${token}`;
      
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const token = generateToken(mockUser);
      req.headers.authorization = `Bearer ${token}`;
      
      User.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Not authorized to access this route',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should extract token from Bearer scheme', async () => {
      const token = generateToken(mockUser);
      req.headers.authorization = `Bearer ${token}`;
      
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await protect(req, res, next);

      expect(req.user).toBeDefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('authorize middleware', () => {
    beforeEach(() => {
      req.user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
      };
    });

    it('should allow access for authorized role', () => {
      const middleware = authorize('user', 'admin');
      
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny access for unauthorized role', () => {
      const middleware = authorize('admin');
      
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "User role 'user' is not authorized to access this route",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow admin role', () => {
      req.user.role = 'admin';
      const middleware = authorize('admin');
      
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle multiple allowed roles', () => {
      const middleware = authorize('user', 'admin', 'moderator');
      
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny access when role not in allowed list', () => {
      req.user.role = 'guest';
      const middleware = authorize('user', 'admin');
      
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Middleware chain integration', () => {
    it('should call next() to continue middleware chain', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: 'user',
      };
      
      const token = generateToken(mockUser);
      req.headers.authorization = `Bearer ${token}`;
      
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await protect(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    it('should not call next() on authentication failure', async () => {
      await protect(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
