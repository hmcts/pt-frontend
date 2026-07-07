import { Request } from 'express';
import type { Environment } from 'nunjucks';

import { flowConfig } from '../../../../main/steps/pre-application/flow.config';
import { step } from '../../../../main/steps/pre-application/landlord-is-a-housing-association';

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

describe('pre-application landlord-is-a-housing-association step', () => {
  const nunjucksEnv = { render: jest.fn() } as unknown as Environment;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createReq = (overrides: Record<string, unknown> = {}): any => ({
    body: {},
    originalUrl: '/pre-application/landlord-is-a-housing-association',
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

  it('should redirect to /login with no selection', async () => {
    (validateForm as jest.Mock).mockReturnValue({});
    const req = createReq({ body: { action: 'continue', landlordIsAHousingAssociation: 'no' } });
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

describe('back navigation from landlord-is-a-housing-association', () => {
  it('uses address-of-property as previous step', async () => {
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
            addressPostcode: 'W1 1BW',
          },
        },
      },
    } as unknown as Request;
    await expect(getPreviousStep(req, 'landlord-is-a-housing-association', flowConfig, {})).resolves.toBe(
      'address-of-property'
    );
  });
});
