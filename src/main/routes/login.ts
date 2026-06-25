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
  app.get(SIGN_OUT_URL, (req, res) => req.session.destroy(() => res.redirect('/')));
  app.get(CALLBACK_URL, callbackHandler(protocol, port));
}

function callbackHandler(protocol: string, port: string) {
  return async (req: Request, res: Response) => {
    if (typeof req.query.code === 'string') {
      try {
        //TODO: use the below once session code is set up as part of https://tools.hmcts.net/jira/browse/HDPD-500
        // req.session.user = await getUserDetails(`${protocol}${res.locals.host}${port}`, req.query.code, callbackUrl);

        //TODO: remove below 2 lines of code once https://tools.hmcts.net/jira/browse/HDPD-500 implemented
        const userDetails = await getUserDetails(`${protocol}${res.locals.host}${port}`, req.query.code);
        req.session.id = userDetails.id;
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
