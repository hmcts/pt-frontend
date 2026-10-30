import config from 'config';
import { Application, NextFunction, type Request, type Response } from 'express';

import { HTTPError } from '../HttpError';
import { UserDetails, getEndIdamSessionUrl, getRedirectUrl, getUserDetails } from '../auth/user/oidc';
import { hasRequiredRole } from '../auth/user/roles';
import { CALLBACK_URL, SIGN_IN_URL, SIGN_OUT_URL } from '../urls';

import { Logger } from '@modules/logger';
import { isSecureTransport } from '@utils/environment';

const logger = Logger.getLogger('login routes');

export default function (app: Application): void {
  const secure = isSecureTransport();
  const protocol = secure ? 'https://' : 'http://';
  const port = secure ? '' : `:${config.get('port')}`;

  app.get(SIGN_IN_URL, (_req, res) => res.redirect(getRedirectUrl(`${protocol}${res.locals.host}${port}`)));
  app.get(SIGN_OUT_URL, (req, res) => {
    req.session.destroy((err: unknown) => {
      if (err) {
        logger.error('Session destroyed error:', err);
      }
      res
        .clearCookie(config.get('session.cookieName'), { path: '/' })
        .setHeader('Clear-Site-Data', '"cache", "cookies", "storage"')
        .redirect(getEndIdamSessionUrl(`${protocol}${res.locals.host}${port}`));
    });
  });
  app.get(CALLBACK_URL, callbackHandler(protocol, port));
}

function callbackHandler(protocol: string, port: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (typeof req.query.code !== 'string') {
      return res.redirect(SIGN_IN_URL);
    }

    let user: UserDetails;
    try {
      user = await getUserDetails(`${protocol}${res.locals.host}${port}`, req.query.code);
    } catch (e) {
      logger.error('Failed to get user details: ', e);
      return res.redirect(SIGN_IN_URL);
    }

    req.session.regenerate(err => {
      if (err) {
        logger.error('Session regenerate error:', err);
        return res.redirect(SIGN_IN_URL);
      }
      if (!hasRequiredRole(user)) {
        logger.warn('User without citizen role attempted sign-in', { userId: user.id });
        return next(new HTTPError('User lacks required citizen role', 403));
      }
      req.session.user = user;
      req.session.save(() => res.redirect('/'));
    });
  };
}
