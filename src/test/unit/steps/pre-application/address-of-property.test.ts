import { Request } from 'express';
import type { Environment } from 'nunjucks';

import { step } from '../../../../main/steps/pre-application/address-of-property';
import { flowConfig } from '../../../../main/steps/pre-application/flow.config';

import { validateForm } from '@modules/steps';
import { getNextStep, getPreviousStep } from '@modules/steps/flow';

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

describe('pre-application address-of-property step', () => {
  const nunjucksEnv = { render: jest.fn() } as unknown as Environment;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createReq = (overrides: Record<string, unknown> = {}): any => ({
    body: {},
    originalUrl: '/pre-application/address-of-property',
    query: { lang: 'en' },
    session: {
      formData: {
        'starting-or-returning': {
          startingOrReturning: 'starting',
        },
        'applying-for-yourself-or-someone-else': {
          applyingForYourselfOrSomeoneElse: 'myself',
        },
      },
    },
    app: { locals: { nunjucksEnv } },
    i18n: { getResourceBundle: jest.fn(() => ({})) },
    res: { locals: {} },
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps postcode entry', async () => {
    (validateForm as jest.Mock).mockReturnValue({});
    const req = createReq({ body: { action: 'continue', addressPostcode: 'W1 1BW' } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = { redirect: jest.fn() } as any;
    const next = jest.fn();

    if (!step.postController) {
      throw new Error('expected postController');
    }

    await step.postController.post(req, res, next);

    expect(req.session.formData).toStrictEqual({
      'starting-or-returning': { startingOrReturning: 'starting' },
      'applying-for-yourself-or-someone-else': { applyingForYourselfOrSomeoneElse: 'myself' },
      'address-of-property': {
        addressPostcode: 'W1 1BW',
      },
    });
  });
});
describe('forward navigation from address-of-property', () => {
  it('goes to landlord-is-a-housing-association when postcode is valid', async () => {
    const req = {
      session: {
        formData: {
          'starting-or-returning': {
            startingOrReturning: 'starting',
          },
          'applying-for-yourself-or-someone-else': {
            applyingForYourselfOrSomeoneElse: 'myself',
          },
          'address-of-property': {
            addressPostcode: 'W1 1BW',
          },
        },
      },
    } as unknown as Request;
    await expect(getNextStep(req, 'address-of-property', flowConfig, {})).resolves.toBe(
      'landlord-is-a-housing-association'
    );
  });

  it('goes to you-need-to-use-another-form when postcode is not an England postcode', async () => {
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
            addressPostcode: 'BT1 1BW',
          },
        },
      },
    } as unknown as Request;
    await expect(getNextStep(req, 'address-of-property', flowConfig, {})).resolves.toBe(
      'you-need-to-use-another-form-postcode'
    );
  });
});

describe('back navigation from address-of-property', () => {
  it('uses starting-or-returning as previous step', async () => {
    const req = {
      session: {
        formData: {
          'starting-or-returning': {
            startingOrReturning: 'starting',
          },
          'applying-for-yourself-or-someone-else': {
            applyingForYourselfOrSomeoneElse: 'myself',
          },
        },
      },
    } as unknown as Request;
    await expect(getPreviousStep(req, 'address-of-property', flowConfig, {})).resolves.toBe(
      'applying-for-yourself-or-someone-else'
    );
  });
});
