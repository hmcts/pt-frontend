import axios, { AxiosRequestHeaders, AxiosResponse, AxiosStatic } from 'axios';
import { sign } from 'jsonwebtoken';
import NodeCache from 'node-cache';

import { OidcResponse, getRedirectUrl, getSystemUser, getUserDetails } from '../../../../main/auth/user/oidc';

const config = require('config');

jest.mock('axios');
jest.mock('config');
jest.mock('node-cache');

const mockedConfig = config as jest.Mocked<typeof config>;
const mockedAxios = axios as jest.Mocked<AxiosStatic>;
const MockedNodeCache = NodeCache as jest.MockedClass<typeof NodeCache>;
const mockedCacheInstance = MockedNodeCache.mock.instances[0] as jest.Mocked<NodeCache>;

const mockSecret = 'mock-secret';
const mockPayload = {
  uid: '123',
  id: '123',
  sub: 'test@test.com',
  email: 'test@test.com',
  given_name: 'John',
  family_name: 'Smith',
  roles: ['citizen'],
};
const mockSystemPayload = {
  uid: '456',
  sub: 'user-email',
  name: 'System',
  roles: ['pt-system-update', 'caseworker', 'caseworker-pt'],
};
// Generate a mock JWT for testing
const mockToken = sign(mockPayload, mockSecret, { expiresIn: '1h' });
const mockSystemToken = sign(mockSystemPayload, mockSecret, { expiresIn: '1h' });

describe('getRedirectUrl', () => {
  test('should create a valid URL to redirect to the login screen', () => {
    mockedConfig.get.mockReturnValueOnce('pt-frontend');
    mockedConfig.get.mockReturnValueOnce('https://idam-web-public.aat.platform.hmcts.net/login');
    expect(getRedirectUrl('http://localhost')).toBe(
      'https://idam-web-public.aat.platform.hmcts.net/login?client_id=pt-frontend&response_type=code&redirect_uri=http://localhost/oauth2/callback'
    );
  });
});

describe('getUserDetails', () => {
  test('should exchange a code for a token and decode a JWT to get the user details when caching disabled', async () => {
    mockedConfig.get.mockReturnValueOnce('pt-frontend');
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        id_token: mockToken,
        access_token: 'token',
      },
    } as AxiosResponse);

    const result = await getUserDetails('http://localhost', '123');
    expect(result).toStrictEqual({
      accessToken: 'token',
      email: 'test@test.com',
      givenName: 'John',
      familyName: 'Smith',
      id: '123',
      roles: ['citizen'],
    });
  });

  test('should retrieve token from cache when caching enabled and cache hit', async () => {
    mockedCacheInstance.get.mockReturnValueOnce({
      data: {
        id_token: mockToken,
        access_token: 'token',
      },
    });
    mockedConfig.get.mockReturnValueOnce(true);

    const result = await getUserDetails('http://localhost', '123');
    expect(result).toStrictEqual({
      accessToken: 'token',
      email: 'test@test.com',
      givenName: 'John',
      familyName: 'Smith',
      id: '123',
      roles: ['citizen'],
    });
  });

  test('should create a new IDAM token and add it to cache if caching enabled but cache miss', async () => {
    mockedConfig.get.mockReturnValueOnce(true);
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        id_token: mockToken,
        access_token: 'token',
      },
    } as AxiosResponse);

    const result = await getUserDetails('http://localhost', '123');
    expect(result).toStrictEqual({
      accessToken: 'token',
      email: 'test@test.com',
      givenName: 'John',
      familyName: 'Smith',
      id: '123',
      roles: ['citizen'],
    });
    expect(mockedCacheInstance.set).toHaveBeenCalled();
  });

  test('should throw error if missing data from request', async () => {
    await expect(getUserDetails('http://localhost', '')).rejects.toThrow('Missing data for createIdamToken.');
  });
});

describe('getSystemUser', () => {
  const accessTokenResponse: AxiosResponse<OidcResponse> = {
    status: 200,
    data: {
      id_token: mockSystemToken,
      access_token: 'systemUserTestToken',
    },
    statusText: 'wsssw',
    headers: { test: 'now' },
    config: { headers: [] as unknown as AxiosRequestHeaders },
  };

  const expectedGetSystemUserResponse: {
    givenName: undefined;
    familyName: undefined;
    roles: string[];
    id: string;
    accessToken: string;
    email: string;
  } = {
    email: 'user-email',
    accessToken: 'systemUserTestToken',
    id: '456',
    givenName: undefined,
    familyName: undefined,
    roles: ['pt-system-update', 'caseworker', 'caseworker-pt'],
  };

  test('Cache enabled', async () => {
    mockedConfig.get.mockReturnValueOnce('pt-frontend');
    mockedConfig.get.mockReturnValueOnce('https://idam-web-public.aat.platform.hmcts.net/login');
    mockedConfig.get.mockReturnValueOnce('true');
    mockedAxios.post.mockResolvedValue(accessTokenResponse);

    const result = await getSystemUser();
    expect(result).toStrictEqual(expectedGetSystemUserResponse);
  });

  test('Cache disabled', async () => {
    mockedConfig.get.mockReturnValueOnce('pt-frontend');
    mockedConfig.get.mockReturnValueOnce('https://idam-web-public.aat.platform.hmcts.net/loginwddwdw');
    mockedConfig.get.mockReturnValue('false');
    mockedAxios.post.mockResolvedValue(accessTokenResponse);

    const result = await getSystemUser();
    expect(result).toStrictEqual(expectedGetSystemUserResponse);
  });
});
