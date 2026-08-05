import { Request } from 'express';
import type { Environment } from 'nunjucks';

import { flowConfig } from '../../../../main/steps/pre-application/flow.config';
import { step } from '../../../../main/steps/pre-application/who-is-named-on-your-tenancy-agreement';

import { validateForm } from '@modules/steps';
import { getPreviousStep } from '@modules/steps/flow';

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

describe('pre-application who-is-named-on-your-tenancy-agreement step', () => {
  const nunjucksEnv = { render: jest.fn() } as unknown as Environment;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createReq = (overrides: Record<string, unknown> = {}): any => ({
    body: {},
    originalUrl: '/pre-application/who-is-named-on-your-tenancy-agreement',
    query: { lang: 'en' },
    session: {
      formData: {
        'starting-or-returning': {
          startingOrReturning: 'starting',
        },
        'applying-for-yourself-or-someone-else': {
          applyingForYourselfOrSomeoneElse: 'someoneElse',
        },
        'address-of-property': {
          addressPostcode: 'W1 1BW',
        },
        'landlord-is-a-housing-association': {
          landlordIsAHousingAssociation: 'no',
        },
        'application-type': {
          applicationType: 'openMarketRentDetermination',
        },
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

  it('should redirect to /login with tenant selection', async () => {
    (validateForm as jest.Mock).mockReturnValue({});
    const req = createReq({ body: { action: 'continue', tenantOrJointTenant: 'tenant' } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = { redirect: jest.fn(), headersSent: true } as any;
    const next = jest.fn();

    if (!step.postController) {
      throw new Error('expected postController');
    }

    await step.postController.post(req, res, next);

    expect(req.res.redirect).toHaveBeenCalled();
    expect(req.res.redirect).toHaveBeenCalledWith(303, '/login');
  });
});

describe('back navigation from who-is-named-on-your-tenancy-agreement', () => {
  it('uses application-type as previous step', async () => {
    const req = {
      session: {
        formData: {
          'starting-or-returning': {
            startingOrReturning: 'starting',
          },
          'applying-for-yourself-or-someone-else': {
            applyingForYourselfOrSomeoneElse: 'someoneElse',
          },
          'address-of-property': {
            addressPostcode: 'B5 4BU',
          },
          'landlord-is-a-housing-association': {
            landlordIsAHousingAssociation: 'no',
          },
          'application-type': {
            applicationType: 'openMarketRentDetermination',
          },
        },
      },
    } as unknown as Request;
    await expect(getPreviousStep(req, 'who-is-named-on-your-tenancy-agreement', flowConfig, {})).resolves.toBe(
      'application-type'
    );
  });
});
