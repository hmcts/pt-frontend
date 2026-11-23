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

describe('getAllCasesByApplicantUser', () => {
  test('Should fetch all cases created by applicant user', async () => {
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
    const result = await ptApiInstance.getAllCasesByApplicantUser();
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

    await expect(ptApiInstance.getAllCasesByApplicantUser()).rejects.toThrow('Could not fetch cases');
  });
});

describe('getAllCasesByRespondentUser', () => {
  test('Should fetch all cases where user is the respondent on the case', async () => {
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
    const result = await ptApiInstance.getAllCasesByRespondentUser();
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

    await expect(ptApiInstance.getAllCasesByRespondentUser()).rejects.toThrow('Could not fetch cases');
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

describe('linkPartyToCase', () => {
  test('Should successfully link party to the case', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.post.mockResolvedValue({});

    const ptApiInstance: PtApiClient = new PtApiClient(mockedAxios);
    await ptApiInstance.linkPartyToCase(TEST_CASE_ID, 'test-access-code');

    expect(mockedAxios.post).toHaveBeenCalledWith(`/cases/${TEST_CASE_ID}/validate-access-code`, {
      accessCode: 'test-access-code',
    });
  });

  test('Should throw error when the party could not be linked to the case', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.post.mockRejectedValue(new Error('Party could not be linked to the case'));

    const ptApiInstance: PtApiClient = new PtApiClient(mockedAxios);

    await expect(ptApiInstance.linkPartyToCase(TEST_CASE_ID, 'test-access-code')).rejects.toThrow(
      'Party could not be linked to the case'
    );
  });
});

describe('createCardPayment', () => {
  beforeEach(() => jest.clearAllMocks());

  test('Should create a card payment and return the response', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    const paymentResponse = {
      paymentReference: 'RC-1234-5678-9012-3456',
      status: 'Initiated',
      nextUrl: 'https://card.payments.service.gov.uk/secure/abc',
    };
    mockedAxios.post.mockResolvedValue({ data: paymentResponse });

    const ptApiInstance = new PtApiClient(mockedAxios);
    const result = await ptApiInstance.createCardPayment('2026-1234567890', {
      language: 'en',
      returnUrl: 'https://pt-frontend/payment/return',
    });

    expect(mockedAxios.post).toHaveBeenCalledWith('/payment/service-request/2026-1234567890/card-payment', {
      language: 'en',
      returnUrl: 'https://pt-frontend/payment/return',
    });
    expect(result).toEqual(paymentResponse);
  });

  test('Should throw error when card payment could not be created', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.post.mockRejectedValue(new Error('Card payment could not be created'));

    const ptApiInstance = new PtApiClient(mockedAxios);

    await expect(
      ptApiInstance.createCardPayment('2026-1234567890', {
        language: 'en',
        returnUrl: 'https://pt-frontend/payment/return',
      })
    ).rejects.toThrow('Card payment could not be created');
  });
});

describe('getCardPaymentStatus', () => {
  beforeEach(() => jest.clearAllMocks());

  test('Should get the card payment status', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockResolvedValue({ data: { status: 'Success' } });

    const ptApiInstance = new PtApiClient(mockedAxios);
    const result = await ptApiInstance.getCardPaymentStatus('RC-1234-5678-9012-3456');

    expect(mockedAxios.get).toHaveBeenCalledWith('/payment/card-payment/RC-1234-5678-9012-3456/status');
    expect(result).toEqual({ status: 'Success' });
  });

  test('Should throw error when the card payment status could not be fetched', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockRejectedValue(new Error('Card payment status could not be fetched'));

    const ptApiInstance = new PtApiClient(mockedAxios);

    await expect(ptApiInstance.getCardPaymentStatus('RC-1234-5678-9012-3456')).rejects.toThrow(
      'Card payment status could not be fetched'
    );
  });
});
