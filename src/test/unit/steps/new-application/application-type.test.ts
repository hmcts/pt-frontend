import { Request } from 'express';
import type { Environment } from 'nunjucks';

import { step } from '../../../../main/steps/new-application/application-type';
import { flowConfig } from '../../../../main/steps/new-application/flow.config';

import { getNextStep, validateForm } from '@modules/steps';

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

describe('new-application application-type step', () => {
  const nunjucksEnv = { render: jest.fn() } as unknown as Environment;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createReq = (overrides: Record<string, unknown> = {}): any => ({
    body: {},
    originalUrl: '/new-application/application-type',
    query: { lang: 'en' },
    session: { formData: {} },
    app: { locals: { nunjucksEnv } },
    i18n: { getResourceBundle: jest.fn(() => ({})) },
    res: { locals: {}, redirect: jest.fn() },
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add applicationType field to formData', async () => {
    (validateForm as jest.Mock).mockReturnValue({});
    const req = createReq({ body: { action: 'continue', applicationType: 'challengeRentIncrease' } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = { redirect: jest.fn(), headersSent: true } as any;
    const next = jest.fn();

    if (!step.postController) {
      throw new Error('expected postController');
    }

    await step.postController.post(req, res, next);

    expect(req.session.formData).toStrictEqual({
      'application-type': { applicationType: 'challengeRentIncrease' },
    });
  });
  describe('forward navigation from application-type', () => {
    it('goes to tenancy-type page', async () => {
      const req = {
        session: {
          formData: {
            'application-type': {
              applicationType: 'challengeRentIncrease',
            },
          },
        },
      } as unknown as Request;
      await expect(getNextStep(req, 'application-type', flowConfig, {})).resolves.toBe('tenancy-type');
    });
  });
});
