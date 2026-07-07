import { Request } from 'express';
import type { Environment } from 'nunjucks';

import { step } from '../../../../main/steps/pre-application/applying-for-yourself-or-someone-else';
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

describe('pre-application applying-for-yourself-or-someone-else step', () => {
  const nunjucksEnv = { render: jest.fn() } as unknown as Environment;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createReq = (overrides: Record<string, unknown> = {}): any => ({
    body: {},
    originalUrl: '/pre-application/applying-for-yourself-or-someone-else',
    query: { lang: 'en' },
    session: {
      formData: {
        'starting-or-returning': {
          startingOrReturning: 'starting',
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

  it('maps myself selection', async () => {
    (validateForm as jest.Mock).mockReturnValue({});
    const req = createReq({ body: { action: 'continue', applyingForYourselfOrSomeoneElse: 'myself' } });
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
    });
  });
});
describe('forward navigation from applying-for-yourself-or-someone-else', () => {
  it('goes to address-of-property when applyingForYourselfOrSomeoneElse is myself', async () => {
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
    await expect(getNextStep(req, 'applying-for-yourself-or-someone-else', flowConfig, {})).resolves.toBe(
      'address-of-property'
    );
  });

  it('goes to you-need-to-use-another-form when applyingForYourselfOrSomeoneElse is someoneElse', async () => {
    const req = {
      session: {
        formData: {
          'starting-or-returning': {
            startingOrReturning: 'starting',
          },
          'applying-for-yourself-or-someone-else': {
            applyingForYourselfOrSomeoneElse: 'someoneElse',
          },
        },
      },
    } as unknown as Request;
    await expect(getNextStep(req, 'applying-for-yourself-or-someone-else', flowConfig, {})).resolves.toBe(
      'you-need-to-use-another-form'
    );
  });
});

describe('back navigation from applying-for-yourself-or-someone-else', () => {
  it('uses starting-or-returning as previous step', async () => {
    const req = {} as Request;
    await expect(getPreviousStep(req, 'applying-for-yourself-or-someone-else', flowConfig, {})).resolves.toBe(
      'starting-or-returning'
    );
  });
});
