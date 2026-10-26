jest.mock('axios');

jest.useFakeTimers({ legacyFakeTimers: true });

import axios, { AxiosStatic } from 'axios';

import {
  getTokenFromApi,
  initAuthToken,
  requireServiceAuthToken,
  stopAuthTokenRefresh,
} from '../../../../main/auth/service/get-service-auth-token';
const mockedAxios = axios as jest.Mocked<AxiosStatic>;

const S2S_LEASE_URL = 'http://rpe-service-auth-provider-aat.service.core-compute-aat.internal/lease';

afterEach(() => {
  stopAuthTokenRefresh();
  jest.clearAllMocks();
});

describe('initAuthToken', () => {
  test('Should set an interval to start fetching a token', () => {
    mockedAxios.post.mockResolvedValue('token');

    initAuthToken();
    expect(mockedAxios.post).toHaveBeenCalledWith(
      S2S_LEASE_URL,
      {
        microservice: 'pt_frontend',
        oneTimePassword: expect.anything(),
      },
      expect.objectContaining({ timeout: expect.any(Number) })
    );
  });

  test('Should bound the request so startup cannot block on an unreachable S2S', () => {
    mockedAxios.post.mockResolvedValue({ data: 'token' });

    initAuthToken();

    const requestConfig = mockedAxios.post.mock.calls[0][2];
    expect(requestConfig?.timeout).toBeGreaterThan(0);
  });
});

describe('getTokenFromApi', () => {
  test('Should report success when the lease is granted', async () => {
    mockedAxios.post.mockResolvedValue({ data: 'token' });

    await expect(getTokenFromApi()).resolves.toBe(true);
  });

  test('Should report failure rather than throw when S2S is unreachable', async () => {
    mockedAxios.post.mockRejectedValue({ code: 'ECONNABORTED' });

    await expect(getTokenFromApi()).resolves.toBe(false);
  });
});

describe('requireServiceAuthToken', () => {
  test('Should return the leased token', async () => {
    mockedAxios.post.mockResolvedValue({ data: 'token' });

    initAuthToken();

    return new Promise<void>(resolve => {
      setImmediate(() => {
        expect(requireServiceAuthToken()).toBe('token');
        resolve();
      });
    });
  });
});
