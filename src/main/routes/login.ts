import { promisify } from 'node:util';

import config from 'config';
import { Application, type Request, type Response } from 'express';

import { getRedirectUrl, getUserDetails } from '../auth/user/oidc';
import { CALLBACK_URL, SIGN_IN_URL, SIGN_OUT_URL } from '../urls';

import { Logger } from '@modules/logger';

const logger = Logger.getLogger('login routes');

export default function (app: Application): void {
  const protocol = app.locals.developmentMode ? 'http://' : 'https://';
  const port = app.locals.developmentMode ? `:${config.get('port')}` : '';

  app.get(SIGN_IN_URL, (req, res) => res.redirect(getRedirectUrl(`${protocol}${res.locals.host}${port}`)));
  app.get(SIGN_OUT_URL, async (req, res) => {
    await promisify(req.session.destroy.bind(req.session))();
    res.setHeader('Clear-Site-Data', '*').clearCookie('connect.sid', { path: '/' }).redirect('/');
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
