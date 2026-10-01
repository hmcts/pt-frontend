import * as os from 'os';

import config from 'config';
import { Application, Request, Response } from 'express';

import { Logger } from '@modules/logger';
import loginRoute from '@routes/login';

jest.mock('os');
jest.mock('config');
jest.mock('@modules/logger', () => {
  const logger = { error: jest.fn(), info: jest.fn() };
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

const mockLogger = Logger.getLogger('login routes') as unknown as { error: jest.Mock };

const configValues: Record<string, unknown> = {
  port: 4000,
  'session.cookieName': 'pt_session',
  'idam.endSessionURL': 'https://idam-web-public.aat.platform.hmcts.net/o/endSession',
};

const getLogoutHandler = (): ((req: Request, res: Response) => void) => {
  loginRoute(app);
  const call = (app.get as jest.Mock).mock.calls.find(([path]) => path === '/logout');
  return call[1];
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
});
