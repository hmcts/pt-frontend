import type { Request } from 'express';
import type { Environment } from 'nunjucks';

import { step } from '../../../../main/steps/application/the-rent/the-current-rent-and-other-costs/rent-payment-frequency';

import { createFormStep } from '@modules/steps';

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

/**
 * Covers only what this step adds on top of the form builder. Required
 * behaviour is the framework's, and the amount rules are covered by
 * rentAmount.test.ts, so the validator is only checked for its wiring.
 */
const CASE_REF = '1234123412341234';

describe('application rent-payment-frequency step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];
  const nunjucksEnv = { render: jest.fn(() => '') } as unknown as Environment;

  const stepName = 'rent-payment-frequency';
  const weeklyField = 'rentPaymentFrequency.rentCostWeekly';
  const fortnightlyField = 'rentPaymentFrequency.rentCostFortnightly';
  const monthlyField = 'rentPaymentFrequency.rentCostMonthly';
  const yearlyField = 'rentPaymentFrequency.rentCostYearly';

  // The conditional reveal hides inputs with CSS, so the browser submits all four
  // amount fields on every POST. Tests mirror that by always sending all four.
  const body = (overrides: Record<string, unknown>): Record<string, unknown> => ({
    action: 'continue',
    [weeklyField]: '',
    [fortnightlyField]: '',
    [monthlyField]: '',
    [yearlyField]: '',
    ...overrides,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const post = async (requestBody: Record<string, unknown>): Promise<{ req: any; res: any; next: jest.Mock }> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = { redirect: jest.fn(), render: jest.fn(), send: jest.fn(), locals: {} } as any;
    res.status = jest.fn(() => res);

    const req = {
      body: requestBody,
      originalUrl: `/1234123412341234/${stepName}`,
      query: { lang: 'en' },
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: {} } },
      app: { locals: { nunjucksEnv } },
      i18n: { getResourceBundle: jest.fn(() => ({})) },
      res,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    const next = jest.fn();

    if (!step.postController) {
      throw new Error('expected postController');
    }
    await step.postController.post(req, res, next);
    return { req, res, next };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ['weekly', weeklyField],
    ['fortnightly', fortnightlyField],
    ['monthly', monthlyField],
    ['yearly', yearlyField],
  ])('saves the amount against the field for %s', async (frequency, amountField) => {
    const { req, res } = await post(body({ rentPaymentFrequency: frequency, [amountField]: '850.50' }));

    expect(res.redirect).toHaveBeenCalled();
    expect(req.session.formData[CASE_REF][stepName].rentPaymentFrequency).toBe(frequency);
    expect(req.session.formData[CASE_REF][stepName][amountField]).toBe('850.50');
  });

  it('does not validate the amounts for frequencies that are not selected', async () => {
    const { res } = await post(
      body({
        rentPaymentFrequency: 'weekly',
        [weeklyField]: '200',
        [monthlyField]: 'not-a-number',
      })
    );

    expect(res.redirect).toHaveBeenCalled();
  });

  it('clears the amounts for frequencies that are not selected', async () => {
    const { req } = await post(
      body({
        rentPaymentFrequency: 'weekly',
        [weeklyField]: '200',
        [monthlyField]: '800',
      })
    );

    expect(req.session.formData[CASE_REF][stepName]).toStrictEqual({
      rentPaymentFrequency: 'weekly',
      [weeklyField]: '200',
      [fortnightlyField]: '',
      [monthlyField]: '',
      [yearlyField]: '',
    });
  });

  describe('isAnswered', () => {
    const isAnswered = (currentRentsDetails?: Record<string, unknown>): unknown =>
      step.isAnswered?.({ session: { ccdCase: { currentRentsDetails } } } as unknown as Request);

    it('is not answered when no frequency has been saved', () => {
      expect(isAnswered()).toBe(false);
    });

    it('is answered when a frequency has been saved', () => {
      expect(isAnswered({ rentPaymentFrequency: 'monthly' })).toBe(true);
    });
  });

  describe('amount validator', () => {
    const validate = (value: unknown): boolean | string =>
      capturedConfig.fields[0].options[0].subFields.rentCostWeekly.validator(value);

    it('leaves an empty amount to the required check', () => {
      expect(validate('')).toBe(true);
    });

    it('accepts an amount with pence', () => {
      expect(validate('850.50')).toBe(true);
    });

    it('returns the error key for the field matching the reason the amount is invalid', () => {
      expect(validate('not-a-number')).toBe('errors.rentCostWeekly.invalid');
    });
  });

  it('returns no initial form data when the question has not been answered', () => {
    const req = {
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: {} }, ccdCase: {} },
    } as unknown as Request;

    expect(capturedConfig.getInitialFormData(req)).toEqual({});
  });
});
