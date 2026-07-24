import axios from 'axios';

import { CcdApiClient } from '@services/ccdApiClient';
import { CITIZEN_UPDATE_CASE } from '@services/ccdCase.interface';

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

describe('createCase', () => {
  test('Should create case in ccd', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockResolvedValue({
      data: {
        token: 'ccd_token_for_event',
      },
    });
    mockedAxios.post.mockResolvedValue({
      id: TEST_CASE_ID,
      state: 'DRAFT',
      data: {
        firstName: 'test',
        lastName: 'name',
      },
    });

    const caseApiInstance: CcdApiClient = new CcdApiClient(mockedAxios);
    const result = await caseApiInstance.createCase({
      firstName: 'test',
      lastName: 'name',
    });
    expect(result).toEqual({
      firstName: 'test',
      lastName: 'name',
    });
    expect(mockedAxios.get).toHaveBeenCalledWith('/case-types/PT/event-triggers/citizen-create-application');
  });

  test('Should throw error when case could not be created in ccd', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockRejectedValue(new Error('CCD create case failed'));

    const caseApiInstance: CcdApiClient = new CcdApiClient(mockedAxios);

    await expect(
      caseApiInstance.createCase({
        firstName: 'test',
        lastName: 'name',
      })
    ).rejects.toThrow('CCD create case failed');
  });
});

describe('getEventTrigger', () => {
  test('Should fetch event trigger', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockResolvedValue({
      data: {
        token: 'ccd_token_for_event',
      },
    });

    const caseApiInstance: CcdApiClient = new CcdApiClient(mockedAxios);
    const result = await caseApiInstance.getEventTrigger(TEST_CASE_ID, CITIZEN_UPDATE_CASE);
    expect(result).toEqual({
      token: 'ccd_token_for_event',
    });
    expect(mockedAxios.get).toHaveBeenCalledWith('/cases/1234123412341234/event-triggers/citizen-update-application');
  });

  test('Should throw error when could not fetch event trigger', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockRejectedValue(new Error('Could not fetch event trigger'));

    const caseApiInstance: CcdApiClient = new CcdApiClient(mockedAxios);

    await expect(caseApiInstance.getEventTrigger(TEST_CASE_ID, CITIZEN_UPDATE_CASE)).rejects.toThrow(
      'Could not fetch event trigger'
    );
  });
});

describe('triggerEvent', () => {
  test('Should successfully trigger event', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.post.mockResolvedValue({
      id: TEST_CASE_ID,
      state: 'DRAFT',
      data: {
        firstName: 'test',
        lastName: 'name',
      },
    });

    const caseApiInstance: CcdApiClient = new CcdApiClient(mockedAxios);
    const result = await caseApiInstance.triggerEvent(
      TEST_CASE_ID,
      {
        firstName: 'test',
        lastName: 'name',
      },
      CITIZEN_UPDATE_CASE,
      'event_token'
    );
    expect(result).toEqual({
      firstName: 'test',
      lastName: 'name',
    });
    expect(mockedAxios.post).toHaveBeenCalledWith('/cases/1234123412341234/events', {
      data: { firstName: 'test', lastName: 'name' },
      event: { id: 'citizen-update-application' },
      event_token: 'event_token',
    });
  });

  test('Should throw error when number of retries exhausted', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.post.mockRejectedValue(new Error('Could not trigger event'));

    const caseApiInstance: CcdApiClient = new CcdApiClient(mockedAxios);

    await expect(
      caseApiInstance.triggerEvent(
        TEST_CASE_ID,
        {
          firstName: 'test',
          lastName: 'name',
        },
        CITIZEN_UPDATE_CASE,
        'event_token',
        3
      )
    ).rejects.toThrow('Could not trigger event');
  });
  test('Should throw error when number of retries exhausted and status is 409', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    const error = new Error('Could not update case due to version conflict') as Error & {
      response?: { status: number; data?: unknown };
    };
    error.response = { status: 409 };
    mockedAxios.post.mockRejectedValue(error);

    const caseApiInstance: CcdApiClient = new CcdApiClient(mockedAxios);

    await expect(
      caseApiInstance.triggerEvent(
        TEST_CASE_ID,
        {
          firstName: 'test',
          lastName: 'name',
        },
        CITIZEN_UPDATE_CASE,
        'event_token',
        3
      )
    ).rejects.toThrow('Could not update case due to version conflict');
  });
});
