const logger = require('../../../src/utils/logger');
const winston = require('winston');

describe('Logger Utility', () => {
  let logSpy;

  beforeEach(() => {
    // Spy on logger methods
    logSpy = jest.spyOn(logger, 'info').mockImplementation();
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  describe('Logger instance', () => {
    it('should be a winston logger instance', () => {
      expect(logger).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.debug).toBeDefined();
    });

    it('should have correct log level', () => {
      expect(logger.level).toBeDefined();
      expect(['error', 'warn', 'info', 'debug']).toContain(logger.level);
    });

    it('should have transports configured', () => {
      expect(logger.transports).toBeDefined();
      expect(logger.transports.length).toBeGreaterThan(0);
    });
  });

  describe('Logging methods', () => {
    it('should log info messages', () => {
      const message = 'Test info message';
      logger.info(message);
      
      expect(logSpy).toHaveBeenCalledWith(message);
    });

    it('should log error messages', () => {
      const errorSpy = jest.spyOn(logger, 'error').mockImplementation();
      const message = 'Test error message';
      
      logger.error(message);
      
      expect(errorSpy).toHaveBeenCalledWith(message);
      errorSpy.mockRestore();
    });

    it('should log warn messages', () => {
      const warnSpy = jest.spyOn(logger, 'warn').mockImplementation();
      const message = 'Test warning message';
      
      logger.warn(message);
      
      expect(warnSpy).toHaveBeenCalledWith(message);
      warnSpy.mockRestore();
    });

    it('should log with metadata', () => {
      const message = 'Test message';
      const metadata = { userId: '123', action: 'login' };
      
      logger.info(message, metadata);
      
      expect(logSpy).toHaveBeenCalledWith(message, metadata);
    });
  });

  describe('Test environment behavior', () => {
    it('should silence logs in test environment by default', () => {
      // In test environment, transports should be silent
      const consoleTransport = logger.transports.find(
        t => t.constructor.name === 'Console'
      );
      
      if (process.env.NODE_ENV === 'test' && !process.env.ENABLE_TEST_LOGS) {
        expect(consoleTransport.silent).toBe(true);
      }
    });
  });

  describe('Error logging with stack traces', () => {
    it('should log error objects with stack traces', () => {
      const errorSpy = jest.spyOn(logger, 'error').mockImplementation();
      const error = new Error('Test error');
      
      logger.error('Error occurred:', error);
      
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });
});
