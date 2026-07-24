import axios from 'axios';

import { PtApiClient } from '@services/ptApi/ptApiClient';

jest.mock('@modules/logger', () => ({
  Logger: {
    getLogger: jest.fn(() => ({
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    })),
  },
}));
jest.mock('axios');

const TEST_CASE_ID = '1234123412341234';

describe('getAllCasesByUser', () => {
  test('Should fetch all cases for user', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockResolvedValue({
      data: [
        {
          firstName: 'test1',
          lastName: 'name1',
        },
        {
          firstName: 'test2',
          lastName: 'name2',
        },
      ],
    });

    const ptApiInstance: PtApiClient = new PtApiClient(mockedAxios);
    const result = await ptApiInstance.getAllCasesByUser();
    expect(result).toEqual([
      {
        firstName: 'test1',
        lastName: 'name1',
      },
      {
        firstName: 'test2',
        lastName: 'name2',
      },
    ]);
    expect(mockedAxios.get).toHaveBeenCalledWith('/applications');
  });

  test('Should throw error when cases could not be fetched', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockRejectedValue(new Error('Could not fetch cases'));

    const ptApiInstance: PtApiClient = new PtApiClient(mockedAxios);

    await expect(ptApiInstance.getAllCasesByUser()).rejects.toThrow('Could not fetch cases');
  });
});

describe('getCaseByCaseReference', () => {
  test('Should fetch case by case reference', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockResolvedValue({
      data: {
        firstName: 'test1',
        lastName: 'name1',
      },
    });

    const ptApiInstance: PtApiClient = new PtApiClient(mockedAxios);
    const result = await ptApiInstance.getCaseByCaseReference(TEST_CASE_ID);
    expect(result).toEqual({
      firstName: 'test1',
      lastName: 'name1',
    });
    expect(mockedAxios.get).toHaveBeenCalledWith(`/applications/${TEST_CASE_ID}`);
  });

  test('Should throw error when case could not be fetched by case reference', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockRejectedValue(new Error('Could not fetch case by case reference'));

    const ptApiInstance: PtApiClient = new PtApiClient(mockedAxios);

    await expect(ptApiInstance.getCaseByCaseReference(TEST_CASE_ID)).rejects.toThrow(
      'Could not fetch case by case reference'
    );
  });
});
