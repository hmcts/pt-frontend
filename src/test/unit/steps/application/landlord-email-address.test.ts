import type { Request } from 'express';
import type { Environment } from 'nunjucks';

import { step } from '../../../../main/steps/application/landlord-details/landlord-email-address';

import { createFormStep, validateForm } from '@modules/steps';

jest.mock('@modules/steps', () => {
  const actual = jest.requireActual('@modules/steps');
  return { ...actual, createFormStep: jest.fn(actual.createFormStep) };
});

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

const CASE_REF = '1234123412341234';

describe('application landlord-email-address step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];
  const nunjucksEnv = { render: jest.fn() } as unknown as Environment;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createReq = (overrides: Record<string, unknown> = {}): any => ({
    body: {},
    originalUrl: '/case/1234/application/landlord-email-address',
    query: { lang: 'en' },
    params: { caseReference: CASE_REF },
    session: { formData: { [CASE_REF]: {} } },
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

    expect(req.session.formData[CASE_REF]).toStrictEqual({
      'landlord-email-address': {
        landlordEmailAddress: 'landlord@example.com',
      },
    });
  });

  describe('isAnswered', () => {
    const makeReq = (ccdCase: Record<string, unknown> = {}): Request =>
      ({ session: { ccdCase } }) as unknown as Request;

    it('is not answered when no email address has been saved', () => {
      expect(step.isAnswered?.(makeReq())).toBe(false);
    });

    it('is answered when a valid email address has been saved', () => {
      expect(step.isAnswered?.(makeReq({ landlordEmailAddress: 'landlord@example.com' }))).toBe(true);
    });

    it('is not answered when the saved email address is not valid', () => {
      expect(step.isAnswered?.(makeReq({ landlordEmailAddress: 'landlord@example' }))).toBe(false);
    });
  });

  describe('validator', () => {
    const validate = (value: unknown): boolean | string => capturedConfig.fields[0].validator(value);

    it('accepts a valid email address', () => {
      expect(validate('name@example.co.uk')).toBe(true);
    });

    it('returns the invalid error key for an email address in the wrong format', () => {
      expect(validate('name.example.com')).toBe('errors.landlordEmailAddress.invalid');
    });
  });
});
