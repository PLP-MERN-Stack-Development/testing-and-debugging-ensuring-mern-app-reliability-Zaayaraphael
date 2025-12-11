const errorHandler = require('../../../src/middleware/errorHandler');
const logger = require('../../../src/utils/logger');

// Mock logger
jest.mock('../../../src/utils/logger');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      originalUrl: '/api/test',
      method: 'GET',
      ip: '127.0.0.1',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    
    logger.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Mongoose errors', () => {
    it('should handle CastError (invalid ObjectId)', () => {
      const err = {
        name: 'CastError',
        message: 'Cast to ObjectId failed',
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid ID format',
        details: err.message,
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle duplicate key error', () => {
      const err = {
        code: 11000,
        keyPattern: { email: 1 },
        message: 'Duplicate key error',
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Duplicate field value',
        details: 'email already exists',
      });
    });

    it('should handle ValidationError', () => {
      const err = {
        name: 'ValidationError',
        errors: {
          email: { message: 'Email is required' },
          password: { message: 'Password is required' },
        },
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation error',
        details: ['Email is required', 'Password is required'],
      });
    });
  });

  describe('JWT errors', () => {
    it('should handle JsonWebTokenError', () => {
      const err = {
        name: 'JsonWebTokenError',
        message: 'jwt malformed',
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid token',
        details: err.message,
      });
    });

    it('should handle TokenExpiredError', () => {
      const err = {
        name: 'TokenExpiredError',
        message: 'jwt expired',
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token expired',
        details: err.message,
      });
    });
  });

  describe('Generic errors', () => {
    it('should handle generic error with status code', () => {
      const err = {
        statusCode: 404,
        message: 'Resource not found',
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Resource not found',
      });
    });

    it('should default to 500 for errors without status code', () => {
      const err = {
        message: 'Something went wrong',
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Something went wrong',
      });
    });

    it('should use default message for errors without message', () => {
      const err = {};

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Server Error',
      });
    });
  });

  describe('Error logging', () => {
    it('should log error details', () => {
      const err = {
        message: 'Test error',
        stack: 'Error stack trace',
      };

      errorHandler(err, req, res, next);

      expect(logger.error).toHaveBeenCalledWith('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
      });
    });

    it('should log all error information', () => {
      const err = new Error('Test error');

      errorHandler(err, req, res, next);

      expect(logger.error).toHaveBeenCalled();
      const logCall = logger.error.mock.calls[0];
      expect(logCall[1]).toHaveProperty('message');
      expect(logCall[1]).toHaveProperty('stack');
      expect(logCall[1]).toHaveProperty('url');
      expect(logCall[1]).toHaveProperty('method');
    });
  });

  describe('Development vs Production', () => {
    const originalEnv = process.env.NODE_ENV;

    afterAll(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should include stack trace in development', () => {
      process.env.NODE_ENV = 'development';
      const err = {
        message: 'Test error',
        stack: 'Error stack trace',
      };

      errorHandler(err, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Test error',
          stack: 'Error stack trace',
        })
      );
    });

    it('should not include stack trace in production', () => {
      process.env.NODE_ENV = 'production';
      const err = {
        message: 'Test error',
        stack: 'Error stack trace',
      };

      errorHandler(err, req, res, next);

      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall).not.toHaveProperty('stack');
    });
  });

  describe('Error response format', () => {
    it('should always include error message', () => {
      const err = { message: 'Test error' };

      errorHandler(err, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });

    it('should include details for specific error types', () => {
      const err = {
        name: 'ValidationError',
        errors: {
          field: { message: 'Field error' },
        },
      };

      errorHandler(err, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
          details: expect.any(Array),
        })
      );
    });
  });
});
