import config from 'config';
import { Application, type Request, type Response } from 'express';

import { getEndIdamSessionUrl, getRedirectUrl, getUserDetails } from '../auth/user/oidc';
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
  return async (req: Request, res: Response) => {
    if (typeof req.query.code === 'string') {
      try {
        req.session.user = await getUserDetails(`${protocol}${res.locals.host}${port}`, req.query.code);
      } catch (e) {
        logger.error('Failed to get user details: ', e);
        return res.redirect(SIGN_IN_URL);
      }
      return req.session.save(() => res.redirect('/'));
    } else {
      return res.redirect(SIGN_IN_URL);
    }
  };
}
