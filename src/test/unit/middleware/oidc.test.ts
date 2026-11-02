import type { NextFunction, Request, Response } from 'express';
import { decodeJwt } from 'jose';
import { sign } from 'jsonwebtoken';

import { clearRefreshInProgressForTesting, oidcMiddleware } from '../../../main/middleware/oidc';

import { Logger } from '@modules/logger';

jest.mock('jose', () => ({
  decodeJwt: jest.fn((token: string) => JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())),
}));
jest.mock('config', () => ({
  get: jest.fn((key: string) => (key === 'oidc.accessTokenEarlyRefreshSeconds' ? 30 : undefined)),
}));
jest.mock('@modules/logger', () => {
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  return { Logger: { getLogger: () => logger } };
});

const logger = Logger.getLogger('oidcMiddleware') as unknown as Record<'info' | 'warn' | 'error', jest.Mock>;

const NOW_SECONDS = 1_800_000_000;
const PAGE = '/1234123412341234/rent-details';
const SECRET = 'test-secret';

const tokenExpiringIn = (seconds: number): string => sign({ uid: 'user-1', exp: NOW_SECONDS + seconds }, SECRET);
const tokenWithoutExpiry = sign({ uid: 'user-1' }, SECRET, { noTimestamp: true });

type SessionUser = Record<string, unknown>;
type TestSession = { user?: SessionUser; returnTo?: string; save: jest.Mock };

const signedInUser = (overrides: SessionUser = {}): SessionUser => ({
  uid: 'user-1',
  accessToken: tokenExpiringIn(3600),
  refreshToken: 'refresh-token',
  idToken: 'id-token',
  ...overrides,
});
const expiredUser = (overrides: SessionUser = {}): SessionUser =>
  signedInUser({ accessToken: tokenExpiringIn(-60), ...overrides });

const makeSession = (user?: SessionUser, extra: Partial<TestSession> = {}): TestSession => ({
  user,
  save: jest.fn((done: () => void) => done()),
  ...extra,
});

const refreshUserTokens = jest.fn();

const makeRequest = (session: TestSession | undefined, locals: Record<string, unknown> = {}) => {
  const addGlobal = jest.fn();
  const req = {
    originalUrl: PAGE,
    sessionID: 'session-1',
    session,
    app: { locals: { nunjucksEnv: { addGlobal }, oidc: { refreshUserTokens }, ...locals } },
  } as unknown as Request;
  const res = { redirect: jest.fn() } as unknown as Response & { redirect: jest.Mock };
  const next = jest.fn() as unknown as NextFunction & jest.Mock;
  return { req, res, next, addGlobal };
};

const run = ({ req, res, next }: ReturnType<typeof makeRequest>): Promise<void> =>
  oidcMiddleware(req, res, next) as Promise<void>;

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('oidcMiddleware', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW_SECONDS * 1000 });
    jest.clearAllMocks();
    refreshUserTokens.mockReset();
    clearRefreshInProgressForTesting();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('when nobody is signed in', () => {
    it('remembers the page, saves the session and redirects to login', async () => {
      const session = makeSession();
      const ctx = makeRequest(session);

      await run(ctx);

      expect(session.returnTo).toBe(PAGE);
      expect(session.save).toHaveBeenCalledTimes(1);
      expect(ctx.res.redirect).toHaveBeenCalledWith('/login');
      expect(ctx.next).not.toHaveBeenCalled();
    });

    it('keeps an existing return page and redirects without saving', async () => {
      const session = makeSession(undefined, { returnTo: '/earlier-page' });
      const ctx = makeRequest(session);

      await run(ctx);

      expect(session.returnTo).toBe('/earlier-page');
      expect(session.save).not.toHaveBeenCalled();
      expect(ctx.res.redirect).toHaveBeenCalledWith('/login');
    });

    it('redirects to login when there is no session at all', async () => {
      const ctx = makeRequest(undefined);

      await run(ctx);

      expect(ctx.res.redirect).toHaveBeenCalledWith('/login');
      expect(ctx.next).not.toHaveBeenCalled();
    });
  });

  it('signs the user out when the session user has no access token', async () => {
    const session = makeSession({ uid: 'user-1', refreshToken: 'refresh-token' });
    const ctx = makeRequest(session);

    await run(ctx);

    expect(session.user).toBeUndefined();
    expect(session.returnTo).toBe(PAGE);
    expect(ctx.res.redirect).toHaveBeenCalledWith('/login');
    expect(ctx.next).not.toHaveBeenCalled();
  });

  it('lets the request through without refreshing when the token expires after the early refresh window', async () => {
    const user = signedInUser({ accessToken: tokenExpiringIn(31) });
    const ctx = makeRequest(makeSession(user));

    await run(ctx);

    expect(refreshUserTokens).not.toHaveBeenCalled();
    expect(ctx.addGlobal).toHaveBeenCalledWith('user', user);
    expect(ctx.next).toHaveBeenCalledWith();
  });

  it.each([
    ['expires within the early refresh window', tokenExpiringIn(20)],
    ['has reached the early refresh threshold', tokenExpiringIn(30)],
    ['has already expired', tokenExpiringIn(-60)],
    ['has no exp claim', tokenWithoutExpiry],
  ])('refreshes a token that %s', async (_label, accessToken) => {
    refreshUserTokens.mockResolvedValue({ accessToken: 'new-access-token' });
    const ctx = makeRequest(makeSession(signedInUser({ accessToken })));

    await run(ctx);

    expect(refreshUserTokens).toHaveBeenCalledWith('refresh-token');
    expect(ctx.next).toHaveBeenCalledWith();
  });

  it('treats a token it cannot decode as expired and logs a warning', async () => {
    refreshUserTokens.mockResolvedValue({ accessToken: 'new-access-token' });
    const ctx = makeRequest(makeSession(signedInUser({ accessToken: 'not.a.jwt' })));

    await run(ctx);

    expect(logger.warn).toHaveBeenCalledWith(
      'Failed to decode access token, treating as expired',
      expect.objectContaining({ userId: 'user-1', path: PAGE, reason: 'decode_failed', error: expect.any(String) })
    );
    expect(refreshUserTokens).toHaveBeenCalledWith('refresh-token');
    expect(ctx.next).toHaveBeenCalledWith();
  });

  it('logs the decode failure as text when the decoder throws something other than an Error', async () => {
    (decodeJwt as jest.Mock).mockImplementationOnce(() => {
      throw 'unreadable token';
    });
    refreshUserTokens.mockResolvedValue({ accessToken: 'new-access-token' });

    await run(makeRequest(makeSession(signedInUser())));

    expect(logger.warn).toHaveBeenCalledWith(
      'Failed to decode access token, treating as expired',
      expect.objectContaining({ error: 'unreadable token' })
    );
  });

  it('signs the user out when the token has expired and there is no refresh token', async () => {
    const session = makeSession(expiredUser({ refreshToken: undefined }));
    const ctx = makeRequest(session);

    await run(ctx);

    expect(refreshUserTokens).not.toHaveBeenCalled();
    expect(session.user).toBeUndefined();
    expect(ctx.res.redirect).toHaveBeenCalledWith('/login');
    expect(ctx.next).not.toHaveBeenCalled();
  });

  it('stores the refreshed tokens in the session and continues', async () => {
    const user = expiredUser();
    const session = makeSession(user);
    refreshUserTokens.mockResolvedValue({ accessToken: 'new-access', refreshToken: 'new-refresh', idToken: 'new-id' });
    const ctx = makeRequest(session);

    await run(ctx);

    expect(session.user).toEqual({
      ...user,
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      idToken: 'new-id',
    });
    expect(ctx.addGlobal).toHaveBeenCalledWith('user', session.user);
    expect(ctx.next).toHaveBeenCalledWith();
  });

  it('keeps the old refresh and id tokens when the refresh does not return new ones', async () => {
    const session = makeSession(expiredUser());
    refreshUserTokens.mockResolvedValue({ accessToken: 'new-access' });

    await run(makeRequest(session));

    expect(session.user).toEqual(
      expect.objectContaining({ accessToken: 'new-access', refreshToken: 'refresh-token', idToken: 'id-token' })
    );
  });

  it('signs the user out and redirects to login when the refresh fails', async () => {
    const session = makeSession(expiredUser());
    refreshUserTokens.mockRejectedValue(new Error('IDAM unavailable'));
    const ctx = makeRequest(session);

    await run(ctx);

    expect(session.user).toBeUndefined();
    expect(session.returnTo).toBe(PAGE);
    expect(ctx.res.redirect).toHaveBeenCalledWith('/login');
    expect(ctx.next).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(
      'Token refresh failed',
      expect.objectContaining({ userId: 'user-1', error: 'IDAM unavailable' })
    );
  });

  it('treats a missing oidc module as a failed refresh', async () => {
    const session = makeSession(expiredUser());
    const ctx = makeRequest(session, { oidc: undefined });

    await run(ctx);

    expect(session.user).toBeUndefined();
    expect(ctx.res.redirect).toHaveBeenCalledWith('/login');
    expect(logger.error).toHaveBeenCalledWith(
      'Token refresh failed',
      expect.objectContaining({ error: 'OIDC module not available in app.locals' })
    );
  });

  it('redirects to login if the session has no user once the refresh resolves', async () => {
    const pending = deferred<{ accessToken: string }>();
    refreshUserTokens.mockReturnValue(pending.promise);
    const session = makeSession(expiredUser());
    const ctx = makeRequest(session);

    const result = run(ctx);
    void pending.promise.then(() => delete session.user);
    pending.resolve({ accessToken: 'new-access' });
    await result;

    expect(ctx.res.redirect).toHaveBeenCalledWith('/login');
    expect(ctx.next).not.toHaveBeenCalled();
  });

  describe('when a refresh is already in progress for the session', () => {
    it('waits for it instead of starting a second refresh and then carries on', async () => {
      const pending = deferred<{ accessToken: string }>();
      refreshUserTokens.mockReturnValue(pending.promise);
      const first = makeRequest(makeSession(expiredUser()));
      const second = makeRequest(makeSession(expiredUser()));

      const runs = [run(first), run(second)];
      await Promise.resolve();
      expect(second.next).not.toHaveBeenCalled();

      pending.resolve({ accessToken: 'new-access' });
      await Promise.all(runs);

      expect(refreshUserTokens).toHaveBeenCalledTimes(1);
      expect(second.next).toHaveBeenCalledWith();
      expect(second.res.redirect).not.toHaveBeenCalled();
    });

    it.each([
      ['an Error', new Error('invalid_grant')],
      ['a non Error value', 'invalid_grant'],
    ])('logs and does not refresh again when that refresh fails with %s', async (_label, reason) => {
      const pending = deferred<{ accessToken: string }>();
      refreshUserTokens.mockReturnValue(pending.promise);
      const first = makeRequest(makeSession(expiredUser()));
      const second = makeRequest(makeSession(expiredUser()));

      const runs = [run(first), run(second)];
      pending.reject(reason);
      await Promise.all(runs);

      expect(refreshUserTokens).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(
        'Refresh failed, continuing to handle it below',
        expect.objectContaining({ error: 'invalid_grant' })
      );
    });

    it('forgets a finished refresh after 10 seconds so a later expiry refreshes again', async () => {
      refreshUserTokens.mockResolvedValue({ accessToken: 'new-access' });

      await run(makeRequest(makeSession(expiredUser())));
      jest.advanceTimersByTime(9999);
      await run(makeRequest(makeSession(expiredUser())));
      expect(refreshUserTokens).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(1);
      await run(makeRequest(makeSession(expiredUser())));
      expect(refreshUserTokens).toHaveBeenCalledTimes(2);
    });
  });

  it.each([
    ['an Error', new Error('nunjucks unavailable')],
    ['a thrown string', 'nunjucks unavailable'],
  ])('passes %s thrown while setting the user global on to next', async (_label, thrown) => {
    const ctx = makeRequest(makeSession(signedInUser()));
    ctx.addGlobal.mockImplementation(() => {
      throw thrown;
    });

    await run(ctx);

    expect(ctx.next).toHaveBeenCalledTimes(1);
    expect(ctx.next).toHaveBeenCalledWith(thrown);
    expect(logger.error).toHaveBeenCalledWith(
      'Unexpected error in oidcMiddleware',
      expect.objectContaining({ error: 'nunjucks unavailable', path: PAGE })
    );
  });
});
