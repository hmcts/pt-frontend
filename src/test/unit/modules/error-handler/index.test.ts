/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import type { Express, NextFunction, Request, Response } from 'express';
import { HTTPError } from '../../../../main/HttpError';

const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

jest.mock('../../../../main/modules/logger', () => ({
  Logger: {
    getLogger: jest.fn(() => mockLogger),
  },
}));

import { createErrorHandler, createNotFoundHandler, setupErrorHandlers } from '../../../../main/modules/error-handler';

describe('error-handler', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.set('view engine', 'njk');
    app.set('views', 'src/main/views');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setupErrorHandlers', () => {
    it('should register error handlers without throwing', () => {
      expect(() => setupErrorHandlers(app)).not.toThrow();
    });

    it('should log error', () => {
      const errorHandler = createErrorHandler();
      const err = new HTTPError('Test error', 500);
      err.stack = 'Error stack trace';
      const req = {
        method: 'GET',
        originalUrl: '/test-url',
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn().mockReturnThis(),
        locals: {},
        headersSent: false,
      } as any;
      const next = jest.fn() as NextFunction;

      errorHandler(err, req, res, next);

      expect(mockLogger.error).toHaveBeenCalledWith('Request failed', {
        errorMessage: 'Test error',
        stack: 'Error stack trace',
        method: 'GET',
        status: 500,
        url: '/test-url',
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.render).toHaveBeenCalledWith('error');
    });

    it('should create 404 error for unmatched routes', () => {
      const notFoundHandler = createNotFoundHandler();
      const req = {} as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn().mockReturnThis(),
      } as any;
      const next = jest.fn();

      notFoundHandler(req, res, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.render).toHaveBeenCalledWith('not-found');
    });

    it('should not create 404 error if headers are already sent', () => {
      const notFoundHandler = createNotFoundHandler();
      const req = {} as Request;
      const res = { headersSent: true } as Response;
      const next = jest.fn();

      notFoundHandler(req, res, next as NextFunction);

      expect(next).toHaveBeenCalledWith();
      expect(next).not.toHaveBeenCalledWith(expect.any(HTTPError));
    });

    it('should not create 404 error if response is writableEnded', () => {
      const notFoundHandler = createNotFoundHandler();
      const req = {} as Request;
      const res = { writableEnded: true } as Response & { writableEnded?: boolean };
      const next = jest.fn();

      notFoundHandler(req, res, next as NextFunction);

      expect(next).toHaveBeenCalledWith();
      expect(next).not.toHaveBeenCalledWith(expect.any(HTTPError));
    });
  });
});
