jest.mock('axios');

jest.useFakeTimers({ legacyFakeTimers: true });

import axios, { AxiosStatic } from 'axios';

import { getServiceAuthToken, initAuthToken } from '../../../../main/auth/service/get-service-auth-token';
const mockedAxios = axios as jest.Mocked<AxiosStatic>;

describe('initAuthToken', () => {
  test('Should set an interval to start fetching a token', () => {
    mockedAxios.post.mockResolvedValue('token');

    initAuthToken();
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://rpe-service-auth-provider-aat.service.core-compute-aat.internal/lease',
      {
        microservice: 'pt-frontend',
        oneTimePassword: expect.anything(),
      }
    );
  });
});

describe('getServiceAuthToken', () => {
  test('Should return a token', async () => {
    mockedAxios.post.mockResolvedValue({ data: 'token' });

    initAuthToken();

    return new Promise<void>(resolve => {
      setImmediate(() => {
        expect(getServiceAuthToken()).not.toBeUndefined();
        resolve();
      });
    });
  });
});
