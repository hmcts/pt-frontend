import type { Environment } from 'nunjucks';

import { step } from '../../../../main/steps/application/landlord-details/landlord-email-address';

import { validateForm } from '@modules/steps';

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

describe('application landlord-email-address step', () => {
  const nunjucksEnv = { render: jest.fn() } as unknown as Environment;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createReq = (overrides: Record<string, unknown> = {}): any => ({
    body: {},
    originalUrl: '/case/1234/application/landlord-email-address',
    query: { lang: 'en' },
    session: { formData: {} },
    app: { locals: { nunjucksEnv } },
    i18n: { getResourceBundle: jest.fn(() => ({})) },
    res: { locals: {} },
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps the entered email address', async () => {
    (validateForm as jest.Mock).mockReturnValue({});
    const req = createReq({ body: { action: 'continue', landlordEmailAddress: 'landlord@example.com' } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = { redirect: jest.fn() } as any;
    const next = jest.fn();

    if (!step.postController) {
      throw new Error('expected postController');
    }

    await step.postController.post(req, res, next);

    expect(req.session.formData).toStrictEqual({
      'landlord-email-address': {
        landlordEmailAddress: 'landlord@example.com',
      },
    });
  });
});
