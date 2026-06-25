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

jest.mock('@modules/logger', () => ({
  Logger: {
    getLogger: jest.fn(() => mockLogger),
  },
}));

import { createErrorHandler, createNotFoundHandler, setupErrorHandlers } from '@modules/error-handler';

describe('error-handler', () => {
  let app: Express;

  const createMockTranslation = () => {
    const translations: Record<string, string> = {
      'errorPages.pageNotFound.title': 'Page not found',
      'errorPages.pageNotFound.paragraph': 'If you typed the web address, check it is correct.',
      'errorPages.serviceUnavailable.title': 'Sorry, the service is unavailable',
      'errorPages.serviceUnavailable.paragraphMinutes': 'You will be able to use the service in [minutes] minutes.',
      'errorPages.serviceUnavailable.paragraphDateAndTime': 'You will be able to use the service from [dateAndTime].',
      'errorPages.technicalError.title': 'Sorry, there is a problem with the service',
      'errorPages.technicalError.paragraph': 'Try again later.',
      'errorPages.accessDenied.title': 'You do not have access to this page',
      'errorPages.accessDenied.paragraph':
        'Contact us if you think you should have access, or if you need help with your case.',
      serviceName: 'Property Tribunal',
      phase: 'ALPHA',
      languageToggle: 'Language toggle',
      back: 'Back',
    };
    return (key: string) => translations[key] || key;
  };

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
      expect(() => setupErrorHandlers(app, 'test')).not.toThrow();
    });

    it('should handle HTTPError with status 403', () => {
      const errorHandler = createErrorHandler('test');
      const err = new HTTPError('Not authorised', 403);
      const req = {
        i18n: { getFixedT: () => createMockTranslation() },
        language: 'en',
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn().mockReturnThis(),
        locals: { t: createMockTranslation() },
        headersSent: false,
      } as any;
      const next = jest.fn() as NextFunction;

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.render).toHaveBeenCalledWith('error');
      expect(res.locals.errorPageKey).toBe('accessDenied');
      expect(res.locals.t('errorPages.accessDenied.title')).toBe('You do not have access to this page');
      expect(res.locals.t('errorPages.accessDenied.paragraph')).toBe(
        'Contact us if you think you should have access, or if you need help with your case.'
      );
    });

    it('should handle HTTPError with status 404', () => {
      const errorHandler = createErrorHandler('test');
      const err = new HTTPError('Page not found', 404);
      const req = {
        i18n: { getFixedT: () => createMockTranslation() },
        language: 'en',
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn().mockReturnThis(),
        locals: { t: createMockTranslation() },
        headersSent: false,
      } as any;
      const next = jest.fn() as NextFunction;

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.render).toHaveBeenCalledWith('error');
      expect(res.locals.errorPageKey).toBe('pageNotFound');
      expect(res.locals.t('errorPages.pageNotFound.title')).toBe('Page not found');
      expect(res.locals.t('errorPages.pageNotFound.paragraph')).toBe(
        'If you typed the web address, check it is correct.'
      );
    });

    it('should handle HTTPError with status 500', () => {
      const errorHandler = createErrorHandler('test');
      const err = new HTTPError('Internal server error', 500);
      const req = {
        i18n: { getFixedT: () => createMockTranslation() },
        language: 'en',
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn().mockReturnThis(),
        locals: { t: createMockTranslation() },
        headersSent: false,
      } as any;
      const next = jest.fn() as NextFunction;

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.render).toHaveBeenCalledWith('error');
      expect(res.locals.errorPageKey).toBe('technicalError');
      expect(res.locals.t('errorPages.technicalError.title')).toBe('Sorry, there is a problem with the service');
      expect(res.locals.t('errorPages.technicalError.paragraph')).toBe('Try again later.');
    });

    it('should handle service unavailable with retry after seconds', () => {
      const errorHandler = createErrorHandler('test');
      const err = new HTTPError('Service unavailable', 503, '120');
      const req = {
        i18n: { getFixedT: () => createMockTranslation() },
        language: 'en',
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn().mockReturnThis(),
        locals: { t: createMockTranslation() },
        headersSent: false,
      } as any;
      const next = jest.fn() as NextFunction;

      errorHandler(err, req, res, next);

      expect(res.locals.errorPageKey).toBe('serviceUnavailable');
      expect(res.locals.serviceUnavailableParagraph).toBe('You will be able to use the service in [minutes] minutes.');
    });

    it('should handle service unavailable with retry after date and time', () => {
      const errorHandler = createErrorHandler('test');
      const err = new HTTPError('Service unavailable', 503, 'Wed, 21 Apr 2026 07:28:00 GMT');
      const req = {
        i18n: { getFixedT: () => createMockTranslation() },
        language: 'en',
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn().mockReturnThis(),
        locals: { t: createMockTranslation() },
        headersSent: false,
      } as any;
      const next = jest.fn() as NextFunction;

      errorHandler(err, req, res, next);

      expect(res.locals.errorPageKey).toBe('serviceUnavailable');
      expect(res.locals.serviceUnavailableParagraph).toBe('You will be able to use the service from [dateAndTime].');
    });

    it('should convert non-HTTPError to HTTPError with status 500', () => {
      const errorHandler = createErrorHandler('test');
      const err = new Error('Generic error');
      const req = {
        i18n: { getFixedT: () => createMockTranslation() },
        language: 'en',
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn().mockReturnThis(),
        locals: { t: createMockTranslation() },
        headersSent: false,
      } as any;
      const next = jest.fn() as NextFunction;

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.render).toHaveBeenCalledWith('error');
      expect(res.locals.errorPageKey).toBe('technicalError');
      expect(res.locals.t('errorPages.technicalError.title')).toBe('Sorry, there is a problem with the service');
      expect(res.locals.t('errorPages.technicalError.paragraph')).toBe('Try again later.');
    });

    it('should use fallback message when error has no message', () => {
      const errorHandler = createErrorHandler('test');
      const err = new Error();
      const req = {
        i18n: { getFixedT: () => createMockTranslation() },
        language: 'en',
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn().mockReturnThis(),
        locals: { t: createMockTranslation() },
        headersSent: false,
      } as any;
      const next = jest.fn() as NextFunction;

      errorHandler(err, req, res, next);

      expect(res.locals.message).toBe('Internal server error');
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should expose error details when env is development', () => {
      const errorHandler = createErrorHandler('development');
      const err = new HTTPError('Test error', 500);
      const req = {
        i18n: { getFixedT: () => createMockTranslation() },
        language: 'en',
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn().mockReturnThis(),
        locals: { t: createMockTranslation() },
        headersSent: false,
      } as any;
      const next = jest.fn() as NextFunction;

      errorHandler(err, req, res, next);

      expect(res.locals.error).toEqual(err);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should set template variables for stepsTemplate', () => {
      const errorHandler = createErrorHandler('test');
      const err = new HTTPError('Test error', 500);
      const req = {
        i18n: { getFixedT: () => createMockTranslation() },
        language: 'en',
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn().mockReturnThis(),
        locals: { t: createMockTranslation() },
        headersSent: false,
      } as any;
      const next = jest.fn() as NextFunction;

      errorHandler(err, req, res, next);

      expect(res.locals.serviceName).toBe('Property Tribunal');
      expect(res.locals.phase).toBe('ALPHA');
      expect(res.locals.languageToggle).toBe('Language toggle');
      expect(res.locals.back).toBe('Back');
    });

    it('should not render if headers are already sent', () => {
      const errorHandler = createErrorHandler('test');
      const err = new HTTPError('Test error', 500);
      const req = {} as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn().mockReturnThis(),
        locals: {},
        headersSent: true,
      } as any;
      const next = jest.fn() as NextFunction;

      errorHandler(err, req, res, next);

      expect(res.render).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(err);
    });

    it('should pass to next when response writableEnded', () => {
      const errorHandler = createErrorHandler('test');
      const err = new HTTPError('Test error', 500);
      const req = {} as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn().mockReturnThis(),
        locals: {},
        headersSent: false,
        writableEnded: true,
      } as any;
      const next = jest.fn() as NextFunction;

      errorHandler(err, req, res, next);

      expect(res.render).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(err);
    });

    it('should pass to next when response is finished', () => {
      const errorHandler = createErrorHandler('test');
      const err = new HTTPError('Test error', 500);
      const req = {} as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn().mockReturnThis(),
        locals: {},
        headersSent: false,
        writableEnded: false,
        finished: true,
      } as any;
      const next = jest.fn() as NextFunction;

      errorHandler(err, req, res, next);

      expect(res.render).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(err);
    });

    it('should skip logging for 404 on /.well-known/ URLs', () => {
      const errorHandler = createErrorHandler('test');
      const err = new HTTPError('Page not found', 404);
      const req = {
        originalUrl: '/.well-known/openid-configuration',
        i18n: { getFixedT: () => createMockTranslation() },
        language: 'en',
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn().mockReturnThis(),
        locals: { t: createMockTranslation() },
        headersSent: false,
      } as any;
      const next = jest.fn() as NextFunction;

      errorHandler(err, req, res, next);

      expect(mockLogger.error).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.render).toHaveBeenCalledWith('error');
    });

    it('should skip logging for 404 on favicon.ico requests', () => {
      const errorHandler = createErrorHandler('test');
      const err = new HTTPError('Page not found', 404);
      const req = {
        originalUrl: '/favicon.ico',
        i18n: { getFixedT: () => createMockTranslation() },
        language: 'en',
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn().mockReturnThis(),
        locals: { t: createMockTranslation() },
        headersSent: false,
      } as any;
      const next = jest.fn() as NextFunction;

      errorHandler(err, req, res, next);

      expect(mockLogger.error).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.render).toHaveBeenCalledWith('error');
    });

    it('should handle 400 status with access denied error message', () => {
      const errorHandler = createErrorHandler('test');
      const err = new HTTPError('Bad request', 400);
      const req = {
        i18n: { getFixedT: () => createMockTranslation() },
        language: 'en',
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn().mockReturnThis(),
        locals: { t: createMockTranslation() },
        headersSent: false,
      } as any;
      const next = jest.fn() as NextFunction;

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.locals.errorPageKey).toBe('accessDenied');
      expect(res.locals.t('errorPages.accessDenied.title')).toBe('You do not have access to this page');
    });

    it('should use fallback translation function if i18n is not available', () => {
      const errorHandler = createErrorHandler('test');
      const err = new HTTPError('Test error', 500);
      const req = {} as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn().mockReturnThis(),
        locals: {},
        headersSent: false,
      } as any;
      const next = jest.fn() as NextFunction;

      errorHandler(err, req, res, next);

      expect(res.render).toHaveBeenCalledWith('error');
      expect(res.locals.errorPageKey).toBe('technicalError');
    });

    it('should log error', () => {
      const errorHandler = createErrorHandler('test');
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
    });

    it('should create 404 error for unmatched routes', () => {
      const notFoundHandler = createNotFoundHandler();
      const req = {} as Request;
      const res = {} as Response;
      const next = jest.fn();

      notFoundHandler(req, res, next as NextFunction);

      expect(next).toHaveBeenCalledWith(expect.any(HTTPError));
      expect((next.mock.calls[0][0] as HTTPError).status).toBe(404);
      expect((next.mock.calls[0][0] as HTTPError).message).toBe('Page not found');
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
