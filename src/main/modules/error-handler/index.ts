import type { Express, NextFunction, Request, Response } from 'express';

import { HTTPError } from '../../HttpError';
import { getTranslationFunction, populateCommonTranslations } from '../i18n';

import { getErrorPageKey } from './errorPageKeys';

import { Logger } from '@modules/logger';

const logger = Logger.getLogger('error-handler');

// Paths that generate harmless, expected 404s (bots, crawlers, browser dev-tools probes).
// Centralized here so the not-found handler and error handler stay in sync.
const NOISY_404_PATTERNS: RegExp[] = [
  /^\/\.well-known\//,
  /^\/favicon\.ico$/,
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
  /^\/apple-touch-icon.*\.png$/,
];

function isNoisy404(url: string): boolean {
  return NOISY_404_PATTERNS.some(pattern => pattern.test(url));
}

export function createNotFoundHandler(): (req: Request, res: Response, next: NextFunction) => void {
  return (_req: Request, res: Response, next: NextFunction) => {
    if (!res.headersSent && !(res as { writableEnded?: boolean }).writableEnded) {
      next(new HTTPError('Page not found', 404));
    } else {
      next();
    }
  };
}

export function createErrorHandler(env: string): (err: Error, req: Request, res: Response, next: NextFunction) => void {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent || (res as { writableEnded?: boolean }).writableEnded || res.writableEnded) {
      return next(err);
    }

    const httpError =
      err instanceof HTTPError
        ? err
        : new HTTPError(err.message || 'Internal server error', (err as HTTPError).status || 500);
    const status = httpError.status || 500;
    const url = req.originalUrl || 'Unknown URL';

    if (status === 404 && isNoisy404(url)) {
      logger.debug('Not found', { method: req.method, status, url });
    } else if (status === 404) {
      logger.warn('Page not found', { method: req.method, status, url });
    } else {
      logger.error('Request failed', {
        errorMessage: err.message,
        stack: err.stack,
        method: req.method,
        status,
        url,
      });
    }

    const t = getTranslationFunction(req, ['common']);

    res.locals.message = httpError.message;
    res.locals.error = env === 'development' ? httpError : {};

    const errorPageKey = getErrorPageKey(status);
    res.locals.errorPageKey = errorPageKey;

    if (errorPageKey === 'serviceUnavailable' && httpError.retryAfter) {
      // Retry-After can be seconds or an HTTP date string.
      const retryAfter = httpError.retryAfter;
      const seconds = Number(retryAfter);

      if (!Number.isNaN(seconds)) {
        res.locals.serviceUnavailableParagraph = t('errorPages.serviceUnavailable.paragraphMinutes', {
          minutes: Math.ceil(seconds / 60),
        });
      } else {
        const retryAfterDate = new Date(retryAfter);
        const time = retryAfterDate.toLocaleTimeString('en-GB', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
        });
        const date = retryAfterDate.toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        res.locals.serviceUnavailableParagraph = t('errorPages.serviceUnavailable.paragraphDateAndTime', {
          date,
          time,
        });
      }
    }

    populateCommonTranslations(req, res, t);
    res.status(status);
    res.render('error');
  };
}

export function setupErrorHandlers(app: Express, env: string): void {
  // Auth failure handler - catches 401 errors and redirects to log in
  // This must be before other error handlers to catch 401s before they're rendered as error pages
  app.use(createNotFoundHandler());
  app.use(createErrorHandler(env));
}
