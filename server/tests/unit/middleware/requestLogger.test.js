const requestLogger = require('../../../src/middleware/requestLogger');
const logger = require('../../../src/utils/logger');

// Mock logger
jest.mock('../../../src/utils/logger');

describe('Request Logger Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      originalUrl: '/api/test',
      ip: '127.0.0.1',
      get: jest.fn((header) => {
        if (header === 'user-agent') return 'Test User Agent';
        return null;
      }),
    };
    res = {
      statusCode: 200,
      on: jest.fn(),
    };
    next = jest.fn();
    
    logger.info = jest.fn();
    logger.warn = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Request logging', () => {
    it('should call next() immediately', () => {
      requestLogger(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should register finish event listener', () => {
      requestLogger(req, res, next);

      expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });

    it('should log request details on finish', () => {
      requestLogger(req, res, next);

      // Get the finish callback
      const finishCallback = res.on.mock.calls[0][1];
      
      // Simulate response finish
      finishCallback();

      expect(logger.info).toHaveBeenCalledWith(
        'Request',
        expect.objectContaining({
          method: 'GET',
          url: '/api/test',
          status: 200,
          ip: '127.0.0.1',
          userAgent: 'Test User Agent',
        })
      );
    });

    it('should include duration in log', () => {
      requestLogger(req, res, next);

      const finishCallback = res.on.mock.calls[0][1];
      finishCallback();

      expect(logger.info).toHaveBeenCalledWith(
        'Request',
        expect.objectContaining({
          duration: expect.stringMatching(/\d+ms/),
        })
      );
    });

    it('should log different HTTP methods', () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

      methods.forEach((method) => {
        req.method = method;
        requestLogger(req, res, next);

        const finishCallback = res.on.mock.calls[res.on.mock.calls.length - 1][1];
        finishCallback();

        expect(logger.info).toHaveBeenCalledWith(
          'Request',
          expect.objectContaining({
            method,
          })
        );
      });
    });

    it('should log different status codes', () => {
      const statusCodes = [200, 201, 400, 401, 404, 500];

      statusCodes.forEach((statusCode) => {
        res.statusCode = statusCode;
        requestLogger(req, res, next);

        const finishCallback = res.on.mock.calls[res.on.mock.calls.length - 1][1];
        finishCallback();

        expect(logger.info).toHaveBeenCalledWith(
          'Request',
          expect.objectContaining({
            status: statusCode,
          })
        );
      });
    });
  });

  describe('Slow request detection', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should warn about slow requests (> 1 second)', () => {
      requestLogger(req, res, next);

      const finishCallback = res.on.mock.calls[0][1];
      
      // Advance time by 1500ms
      jest.advanceTimersByTime(1500);
      
      finishCallback();

      expect(logger.warn).toHaveBeenCalledWith(
        'Slow request detected',
        expect.objectContaining({
          method: 'GET',
          url: '/api/test',
          duration: expect.stringMatching(/\d+ms/),
        })
      );
    });

    it('should not warn about fast requests (< 1 second)', () => {
      requestLogger(req, res, next);

      const finishCallback = res.on.mock.calls[0][1];
      
      // Advance time by 500ms
      jest.advanceTimersByTime(500);
      
      finishCallback();

      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('Request metadata', () => {
    it('should log user agent', () => {
      requestLogger(req, res, next);

      const finishCallback = res.on.mock.calls[0][1];
      finishCallback();

      expect(req.get).toHaveBeenCalledWith('user-agent');
      expect(logger.info).toHaveBeenCalledWith(
        'Request',
        expect.objectContaining({
          userAgent: 'Test User Agent',
        })
      );
    });

    it('should log IP address', () => {
      req.ip = '192.168.1.1';
      requestLogger(req, res, next);

      const finishCallback = res.on.mock.calls[0][1];
      finishCallback();

      expect(logger.info).toHaveBeenCalledWith(
        'Request',
        expect.objectContaining({
          ip: '192.168.1.1',
        })
      );
    });

    it('should log full URL', () => {
      req.originalUrl = '/api/posts?page=1&limit=10';
      requestLogger(req, res, next);

      const finishCallback = res.on.mock.calls[0][1];
      finishCallback();

      expect(logger.info).toHaveBeenCalledWith(
        'Request',
        expect.objectContaining({
          url: '/api/posts?page=1&limit=10',
        })
      );
    });
  });

  describe('Middleware chain', () => {
    it('should not block request processing', () => {
      requestLogger(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    it('should work with multiple requests', () => {
      // First request
      requestLogger(req, res, next);
      const finishCallback1 = res.on.mock.calls[0][1];
      
      // Second request
      const req2 = { ...req, originalUrl: '/api/other' };
      const res2 = { ...res, on: jest.fn() };
      requestLogger(req2, res2, next);
      const finishCallback2 = res2.on.mock.calls[0][1];

      // Finish both
      finishCallback1();
      finishCallback2();

      expect(logger.info).toHaveBeenCalledTimes(2);
    });
  });
});
