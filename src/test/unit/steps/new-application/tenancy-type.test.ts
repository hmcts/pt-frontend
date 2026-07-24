import type { Environment } from 'nunjucks';

import { step } from '../../../../main/steps/new-application/tenancy-type';

import { validateForm } from '@modules/steps';

jest.mock('@services/ccdApiClient', () => {
  const createCaseMock = jest.fn(() => ({
    id: '1234123412341234',
    state: 'AWAITING_SUBMISSION_TO_HMCTS',
    applicationType: 'challengeRentIncrease',
    tenancyType: 'assuredPeriodicTenancy',
  }));

  return {
    getCaseApi: jest.fn(() => ({
      createCase: createCaseMock,
    })),
    __createCaseMock: createCaseMock, // expose it for the test
  };
});

const { getCaseApi: getCaseApiMock, __createCaseMock: createCaseMock } = jest.requireMock('@services/ccdApiClient');

jest.mock('../../../../main/modules/steps/i18n', () => ({
  loadStepNamespace: jest.fn(),
  getStepTranslations: jest.fn(() => ({})),
  getTranslationFunction: jest.fn(() => (key: string) => key),
}));

jest.mock('../../../../main/modules/i18n', () => ({
  getRequestLanguage: jest.fn(() => 'en'),
  getCommonTranslations: jest.fn(() => ({})),
}));

jest.mock('../../../../main/modules/steps/formBuilder/helpers', () => {
  const actual = jest.requireActual('../../../../main/modules/steps/formBuilder/helpers');
  return {
    ...actual,
    validateForm: jest.fn(),
  };
});

describe('new-application tenancy-type step', () => {
  const nunjucksEnv = { render: jest.fn() } as unknown as Environment;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createReq = (overrides: Record<string, unknown> = {}): any => ({
    body: {},
    originalUrl: '/new-application/tenancy-type',
    query: { lang: 'en' },
    session: {
      user: {
        accessToken: 'token',
        email: 'test@email.com',
        givenName: 'test',
        familyName: 'name',
        roles: ['citizen'],
      },
      formData: {
        'application-type': { applicationType: 'challengeRentIncrease' },
      },
    },
    app: { locals: { nunjucksEnv } },
    i18n: { getResourceBundle: jest.fn(() => ({})) },
    res: { locals: {}, redirect: jest.fn() },
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add tenancyType field to formData', async () => {
    (validateForm as jest.Mock).mockReturnValue({});
    const req = createReq({ body: { action: 'continue', tenancyType: 'assuredPeriodicTenancy' } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = { redirect: jest.fn(), headersSent: true } as any;
    const next = jest.fn();

    if (!step.postController) {
      throw new Error('expected postController');
    }

    await step.postController.post(req, res, next);

    expect(req.session.formData).toStrictEqual({
      'application-type': { applicationType: 'challengeRentIncrease' },
      'tenancy-type': { tenancyType: 'assuredPeriodicTenancy' },
    });
  });

  it('should create case in ccd and redirect to task-list page', async () => {
    (validateForm as jest.Mock).mockReturnValue({});
    const req = createReq({ body: { action: 'continue', tenancyType: 'assuredPeriodicTenancy' } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = { redirect: jest.fn(), headersSent: true } as any;
    const next = jest.fn();

    if (!step.postController) {
      throw new Error('expected postController');
    }

    await step.postController.post(req, res, next);

    expect(getCaseApiMock).toHaveBeenCalledTimes(1);
    expect(getCaseApiMock).toHaveBeenCalledWith({
      accessToken: 'token',
      email: 'test@email.com',
      givenName: 'test',
      familyName: 'name',
      roles: ['citizen'],
    });

    expect(createCaseMock).toHaveBeenCalledTimes(1);
    expect(createCaseMock).toHaveBeenCalledWith({
      firstName: 'test',
      lastName: 'name',
      applicationType: 'challengeRentIncrease',
      tenancyType: 'assuredPeriodicTenancy',
    });

    expect(req.res.redirect).toHaveBeenCalled();
    expect(req.res.redirect).toHaveBeenCalledWith(303, '/case/1234123412341234/application/task-list');
  });
});
