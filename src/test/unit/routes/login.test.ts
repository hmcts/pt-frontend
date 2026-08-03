import * as os from 'os';

import config from 'config';
import { Application } from 'express';
import { type Request, type Response } from 'express';

import { getUserDetails } from '../../../main/auth/user/oidc';
import { SIGN_IN_URL } from '../../../main/urls';

import loginRoute, { callbackHandler } from '@routes/login';

jest.mock('os');
jest.mock('config');
jest.mock('express', () => ({
  Router: jest.fn().mockReturnValue({
    get: jest.fn(),
  }),
}));
jest.mock('../../../main/auth/user/oidc');
const mockGetUserDetails = jest.mocked(getUserDetails);

const app = {
  get: jest.fn(),
  locals: {
    developmentMode: true,
  },
} as unknown as Application;

describe('login route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (config.get as jest.Mock).mockReturnValue(4000);
    (os.hostname as jest.Mock).mockReturnValue('fake-hostname');
  });

  it('should set up the /login routes', () => {
    loginRoute(app);

    expect(app.get).toHaveBeenCalledWith('/login', expect.any(Function));
    expect(app.get).toHaveBeenCalledWith('/logout', expect.any(Function));
    expect(app.get).toHaveBeenCalledWith('/oauth2/callback', expect.any(Function));
  });
});

describe('callbackHandler', () => {
  const protocol = 'https://';
  const port = '';

  // let req: any;
  // let res: any;
  //
  // beforeEach(() => {
  //   jest.clearAllMocks();
  //
  //   req = {
  //     query: {},
  //     session: {
  //       returnTo: undefined,
  //       regenerate: jest.fn(cb => cb(null)),
  //       save: jest.fn(cb => cb(null)),
  //     },
  //   } as unknown as Request;
  //
  //   res = {
  //     locals: { host: 'example.com' },
  //     redirect: jest.fn(),
  //   } as unknown as Response;
  // });

  it('redirects to sign-in when no code param', async () => {
    const req = { query: {} } as unknown as Request;
    const res = {
      locals: { host: 'example.com' },
      redirect: jest.fn(),
    } as unknown as Response;

    await callbackHandler(protocol, port)(req, res);

    expect(res.redirect).toHaveBeenCalledWith(SIGN_IN_URL);
  });

  it('redirects to sign-in when getUserDetails throws', async () => {
    const req = { query: { code: 'abc123' } } as unknown as Request;
    const res = {
      locals: { host: 'example.com' },
      redirect: jest.fn(),
    } as unknown as Response;

    mockGetUserDetails.mockRejectedValue(new Error('boom'));

    await callbackHandler(protocol, port)(req, res);

    expect(res.redirect).toHaveBeenCalledWith(SIGN_IN_URL);
  });

  it('redirects to sign-in when session.regenerate fails', async () => {
    const req = {
      query: { code: 'abc123' },
      session: {
        returnTo: undefined,
        regenerate: jest.fn(cb => cb(new Error('regen fail'))),
        save: jest.fn(cb => cb(null)),
      },
    } as unknown as Request;
    const res = {
      locals: { host: 'example.com' },
      redirect: jest.fn(),
    } as unknown as Response;

    mockGetUserDetails.mockResolvedValue({
      accessToken: 'token',
      id: 'id',
      email: 'test@email.com',
      givenName: 'test',
      familyName: 'user',
      roles: ['citizen'],
    });

    await callbackHandler(protocol, port)(req, res);

    expect(res.redirect).toHaveBeenCalledWith(SIGN_IN_URL);
  });

  it('redirects to sign-in when session.save fails', async () => {
    const req = {
      query: { code: 'abc123' },
      session: {
        returnTo: undefined,
        regenerate: jest.fn(cb => cb(null)),
        save: jest.fn(cb => cb(new Error('save fail'))),
      },
    } as unknown as Request;
    const res = {
      locals: { host: 'example.com' },
      redirect: jest.fn(),
    } as unknown as Response;

    mockGetUserDetails.mockResolvedValue({
      accessToken: 'token',
      id: 'id',
      email: 'test@email.com',
      givenName: 'test',
      familyName: 'user',
      roles: ['citizen'],
    });

    await callbackHandler(protocol, port)(req, res);

    expect(res.redirect).toHaveBeenCalledWith(SIGN_IN_URL);
  });

  it('sets user on session and redirects to returnTo on success', async () => {
    const req = {
      query: { code: 'abc123' },
      session: {
        returnTo: '/dashboard',
        regenerate: jest.fn(cb => cb(null)),
        save: jest.fn(cb => cb(null)),
        user: {},
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    const res = {
      locals: { host: 'example.com' },
      redirect: jest.fn(),
    } as unknown as Response;

    const user = {
      accessToken: 'token',
      id: 'id',
      email: 'test@email.com',
      givenName: 'test',
      familyName: 'user',
      roles: ['citizen'],
    };

    mockGetUserDetails.mockResolvedValue(user);

    await callbackHandler(protocol, port)(req, res);

    expect(req.session.user).toEqual(user);
    expect(res.redirect).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects to / when no returnTo is set', async () => {
    const req = {
      query: { code: 'abc123' },
      session: {
        returnTo: undefined,
        regenerate: jest.fn(cb => cb(null)),
        save: jest.fn(cb => cb(null)),
      },
    } as unknown as Request;
    const res = {
      locals: { host: 'example.com' },
      redirect: jest.fn(),
    } as unknown as Response;

    mockGetUserDetails.mockResolvedValue({
      accessToken: 'token',
      id: 'id',
      email: 'test@email.com',
      givenName: 'test',
      familyName: 'user',
      roles: ['citizen'],
    });

    await callbackHandler(protocol, port)(req, res);

    expect(res.redirect).toHaveBeenCalledWith('/');
  });
});
