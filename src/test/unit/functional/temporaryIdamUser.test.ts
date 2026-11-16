import { createTemporaryCitizen, idamServiceUrls } from '../../functional/utils/temporaryIdamUser';

describe('temporary IDAM citizen', () => {
  const originalEnvironment = process.env.ENVIRONMENT;
  const originalTokenBase = process.env.IDAM_TOKEN_BASE_URL;
  const originalTestingSupport = process.env.IDAM_TESTING_SUPPORT_URL;

  afterEach(() => {
    restoreEnv('ENVIRONMENT', originalEnvironment);
    restoreEnv('IDAM_TOKEN_BASE_URL', originalTokenBase);
    restoreEnv('IDAM_TESTING_SUPPORT_URL', originalTestingSupport);
    jest.restoreAllMocks();
  });

  it('creates a pt citizen through the testing-support API', async () => {
    delete process.env.ENVIRONMENT;
    delete process.env.IDAM_TOKEN_BASE_URL;
    delete process.env.IDAM_TESTING_SUPPORT_URL;

    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(async (url, init) => {
      const target = String(url);
      if (target.endsWith('/o/token')) {
        return jsonResponse({ access_token: 'token-1' });
      }
      if (target.endsWith('/test/idam/users')) {
        return jsonResponse({ id: 'user-1' }, 201);
      }
      throw new Error(`Unexpected URL ${target} ${JSON.stringify(init)}`);
    });

    const created = await createTemporaryCitizen({
      permanentEmail: 'pt-citizen@test.com',
      password: 'secret-password',
      clientSecret: 'client-secret',
    });

    expect(created.email).toMatch(/^TEST_PT_USER\.citizen\.\d+\.\d{7}@test\.test$/);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const tokenCall = fetchMock.mock.calls[0];
    expect(tokenCall[0]).toBe('https://idam-api.aat.platform.hmcts.net/o/token');
    const tokenBody = tokenCall[1]?.body as URLSearchParams;
    expect(tokenBody.get('grant_type')).toBe('password');
    expect(tokenBody.get('client_id')).toBe('pt-frontend');
    expect(tokenBody.get('client_secret')).toBe('client-secret');
    expect(tokenBody.get('username')).toBe('pt-citizen@test.com');
    expect(tokenBody.get('password')).toBe('secret-password');

    const createCall = fetchMock.mock.calls[1];
    expect(createCall[0]).toBe('https://idam-testing-support-api.aat.platform.hmcts.net/test/idam/users');
    expect(createCall[1]?.headers).toMatchObject({ Authorization: 'Bearer token-1' });
    expect(JSON.parse(String(createCall[1]?.body))).toEqual({
      password: 'secret-password',
      user: {
        email: created.email,
        forename: 'pt',
        surname: 'citizen',
        roleNames: ['citizen'],
      },
    });
  });

  it('follows ENVIRONMENT for the IDAM hosts', () => {
    process.env.ENVIRONMENT = 'demo';
    delete process.env.IDAM_TOKEN_BASE_URL;
    delete process.env.IDAM_TESTING_SUPPORT_URL;

    expect(idamServiceUrls()).toEqual({
      tokenBase: 'https://idam-api.demo.platform.hmcts.net',
      testingSupport: 'https://idam-testing-support-api.demo.platform.hmcts.net',
    });
  });
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = value;
}
