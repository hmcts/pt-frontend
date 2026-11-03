import * as os from 'os';

import config from 'config';
import { Application, NextFunction, Request, Response } from 'express';

import { getUserDetails } from '../../../main/auth/user/oidc';

import { Logger } from '@modules/logger';
import loginRoute from '@routes/login';

jest.mock('os');
jest.mock('config');
jest.mock('jose', () => ({
  decodeJwt: jest.fn(),
}));
jest.mock('../../../main/auth/user/oidc', () => ({
  ...jest.requireActual('../../../main/auth/user/oidc'),
  getUserDetails: jest.fn(),
}));
jest.mock('@modules/logger', () => {
  const logger = { error: jest.fn(), info: jest.fn(), warn: jest.fn() };
  return { Logger: { getLogger: jest.fn(() => logger) } };
});
jest.mock('express', () => ({
  Router: jest.fn().mockReturnValue({
    get: jest.fn(),
  }),
}));

const app = {
  get: jest.fn(),
  locals: {},
} as unknown as Application;

const mockLogger = Logger.getLogger('login routes') as unknown as { error: jest.Mock; warn: jest.Mock };

const configValues: Record<string, unknown> = {
  port: 4000,
  'session.cookieName': 'pt_session',
  'idam.endSessionURL': 'https://idam-web-public.aat.platform.hmcts.net/o/endSession',
  'idam.requiredRole': 'citizen',
};

const getLogoutHandler = (): ((req: Request, res: Response) => void) => {
  loginRoute(app);
  const call = (app.get as jest.Mock).mock.calls.find(([path]) => path === '/logout');
  return call[1];
};

type CallbackSession = Record<string, unknown> & { regenerate: jest.Mock };
type CallbackRequest = { query: { code?: unknown }; session: CallbackSession };
type CallbackHandler = (req: CallbackRequest, res: Response, next: NextFunction) => Promise<unknown>;

const getCallbackHandler = (): CallbackHandler => {
  loginRoute(app);
  const call = (app.get as jest.Mock).mock.calls.find(([path]) => path === '/oauth2/callback');
  return call[1];
};

const buildCallbackRequest = (code: unknown = 'auth-code', regenerateError?: Error) => {
  const freshSession = { save: jest.fn((done: () => void) => done()) };
  const req: CallbackRequest = {
    query: { code },
    session: {
      user: { id: 'previous-user', roles: ['citizen'] },
      ccdCase: { id: 1234123412341234 },
      regenerate: jest.fn((done: (err?: Error) => void) => {
        req.session = freshSession as unknown as CallbackSession;
        done(regenerateError);
      }),
    },
  };
  return { req, freshSession };
};

const buildResponse = (): Response => {
  const res = {
    locals: { host: 'pt.aat.platform.hmcts.net' },
    clearCookie: jest.fn(),
    setHeader: jest.fn(),
    redirect: jest.fn(),
  };
  res.clearCookie.mockReturnValue(res);
  res.setHeader.mockReturnValue(res);
  return res as unknown as Response;
};

const buildRequest = (destroyError?: Error): Request =>
  ({
    session: {
      destroy: jest.fn((callback: (err?: Error) => void) => callback(destroyError)),
    },
  }) as unknown as Request;

describe('login route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (config.get as jest.Mock).mockImplementation((key: string) => configValues[key]);
    (os.hostname as jest.Mock).mockReturnValue('fake-hostname');
  });

  it('should set up the /login routes', () => {
    loginRoute(app);

    expect(app.get).toHaveBeenCalledWith('/login', expect.any(Function));
    expect(app.get).toHaveBeenCalledWith('/logout', expect.any(Function));
    expect(app.get).toHaveBeenCalledWith('/oauth2/callback', expect.any(Function));
  });

  describe('/logout', () => {
    it('should destroy the session, clear site data and redirect to the IDAM end session endpoint', () => {
      const req = buildRequest();
      const res = buildResponse();

      getLogoutHandler()(req, res);

      expect(req.session.destroy).toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith('pt_session', { path: '/' });
      expect(res.setHeader).toHaveBeenCalledWith('Clear-Site-Data', '"cache", "cookies", "storage"');
      expect(res.redirect).toHaveBeenCalledWith(
        'https://idam-web-public.aat.platform.hmcts.net/o/endSession?post_logout_redirect_uri=https%3A%2F%2Fpt.aat.platform.hmcts.net'
      );
    });

    it('should log the error and still redirect to IDAM when the session cannot be destroyed', () => {
      const error = new Error('redis unavailable');
      const res = buildResponse();

      getLogoutHandler()(buildRequest(error), res);

      expect(mockLogger.error).toHaveBeenCalledWith(expect.any(String), error);
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('/o/endSession?post_logout_redirect_uri='));
    });
  });

  describe('/oauth2/callback', () => {
    const citizen = { id: 'citizen-user', roles: ['citizen'] };

    it('starts a new session, signs in a citizen and redirects home', async () => {
      (getUserDetails as jest.Mock).mockResolvedValue(citizen);
      const { req, freshSession } = buildCallbackRequest();
      const regenerate = req.session.regenerate;
      const res = buildResponse();
      const next = jest.fn();

      await getCallbackHandler()(req, res, next);

      expect(getUserDetails).toHaveBeenCalledWith('https://pt.aat.platform.hmcts.net', 'auth-code');
      expect(regenerate).toHaveBeenCalledTimes(1);
      expect(req.session).toBe(freshSession);
      expect(req.session.user).toBe(citizen);
      expect(req.session.ccdCase).toBeUndefined();
      expect(freshSession.save).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/');
      expect(next).not.toHaveBeenCalled();
    });

    it.each([
      ['a different role', ['caseworker']],
      ['no roles', undefined],
    ])('starts a new session without a user and responds 403 for a user with %s', async (_label, roles) => {
      (getUserDetails as jest.Mock).mockResolvedValue({ id: 'other-user', roles });
      const { req, freshSession } = buildCallbackRequest();
      const res = buildResponse();
      const next = jest.fn();

      await getCallbackHandler()(req, res, next);

      expect(req.session).toBe(freshSession);
      expect(req.session.user).toBeUndefined();
      expect(req.session.ccdCase).toBeUndefined();
      expect(freshSession.save).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 403 }));
      expect(res.redirect).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith('User without citizen role attempted sign-in', {
        userId: 'other-user',
      });
    });

    it('logs the error and redirects to sign in when the session cannot be regenerated', async () => {
      (getUserDetails as jest.Mock).mockResolvedValue(citizen);
      const error = new Error('redis unavailable');
      const { req } = buildCallbackRequest('auth-code', error);
      const res = buildResponse();
      const next = jest.fn();

      await getCallbackHandler()(req, res, next);

      expect(mockLogger.error).toHaveBeenCalledWith(expect.any(String), error);
      expect(req.session.user).toBeUndefined();
      expect(res.redirect).toHaveBeenCalledWith('/login');
      expect(next).not.toHaveBeenCalled();
    });

    it('redirects to sign in without touching the session when the token exchange fails', async () => {
      const error = new Error('IDAM unavailable');
      (getUserDetails as jest.Mock).mockRejectedValue(error);
      const { req } = buildCallbackRequest();
      const regenerate = req.session.regenerate;
      const res = buildResponse();

      await getCallbackHandler()(req, res, jest.fn());

      expect(mockLogger.error).toHaveBeenCalledWith(expect.any(String), error);
      expect(regenerate).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith('/login');
    });

    it('redirects to sign in when there is no authorisation code', async () => {
      const { req } = buildCallbackRequest();
      req.query = {};
      const res = buildResponse();

      await getCallbackHandler()(req, res, jest.fn());

      expect(getUserDetails).not.toHaveBeenCalled();
      expect(req.session.regenerate).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith('/login');
    });
  });
});
