import type { Request } from 'express';
import type { Environment } from 'nunjucks';

import { step } from '../../../../main/steps/application/the-rent/the-current-rent-and-other-costs/council-tax-frequency';

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
 * Covers only what this step adds on top of the form builder. Amount format
 * rules are covered by rentAmount.test.ts, so the validators are only checked
 * for their wiring.
 */
const CASE_REF = '1234123412341234';

describe('application council-tax-frequency step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];
  const optionFor = (value: string) =>
    capturedConfig.fields[0].options.find((option: { value: string }) => option.value === value);
  const nunjucksEnv = { render: jest.fn(() => '') } as unknown as Environment;

  const stepName = 'council-tax-frequency';
  const weeklyField = 'councilTaxFrequency.councilTaxCostWeekly';
  const fortnightlyField = 'councilTaxFrequency.councilTaxCostFortnightly';
  const monthlyField = 'councilTaxFrequency.councilTaxCostMonthly';
  const yearlyField = 'councilTaxFrequency.councilTaxCostYearly';
  const detailsField = 'councilTaxFrequency.councilTaxFrequencyAndCostDetails';

  const body = (overrides: Record<string, unknown>): Record<string, unknown> => ({
    action: 'continue',
    [weeklyField]: '',
    [fortnightlyField]: '',
    [monthlyField]: '',
    [yearlyField]: '',
    [detailsField]: '',
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

  it('clears the amounts for frequencies that are not selected', async () => {
    const { req } = await post(
      body({
        councilTaxFrequency: 'weekly',
        [weeklyField]: '120',
        [monthlyField]: '500',
      })
    );

    expect(req.session.formData[CASE_REF][stepName]).toStrictEqual({
      councilTaxFrequency: 'weekly',
      [weeklyField]: '120',
      [fortnightlyField]: '',
      [monthlyField]: '',
      [yearlyField]: '',
      [detailsField]: '',
    });
  });

  it('clears the details when a frequency other than OTHER is selected', async () => {
    const { req } = await post(
      body({
        councilTaxFrequency: 'monthly',
        [monthlyField]: '150',
        [detailsField]: 'Paid quarterly, around 400 each time',
      })
    );

    expect(req.session.formData[CASE_REF][stepName][detailsField]).toBe('');
  });

  it('clears all amounts and keeps the details when OTHER is selected', async () => {
    const { req } = await post(
      body({
        councilTaxFrequency: 'other',
        [weeklyField]: '120',
        [detailsField]: 'Paid quarterly, around 400 each time',
      })
    );

    expect(req.session.formData[CASE_REF][stepName]).toStrictEqual({
      councilTaxFrequency: 'other',
      [weeklyField]: '',
      [fortnightlyField]: '',
      [monthlyField]: '',
      [yearlyField]: '',
      [detailsField]: 'Paid quarterly, around 400 each time',
    });
  });

  it('clears everything when no frequency is selected', async () => {
    const { req, res } = await post(body({ [weeklyField]: '120', [detailsField]: 'some text' }));

    expect(res.redirect).toHaveBeenCalled();
    expect(req.session.formData[CASE_REF][stepName][weeklyField]).toBe('');
    expect(req.session.formData[CASE_REF][stepName][detailsField]).toBe('');
  });

  describe('isAnswered', () => {
    const isAnswered = (rentDetails?: Record<string, unknown>): unknown =>
      step.isAnswered?.({ session: { ccdCase: { rentDetails } } } as unknown as Request);

    it('is not answered when no frequency has been saved', () => {
      expect(isAnswered()).toBe(false);
    });

    it('is answered when a frequency has been saved', () => {
      expect(isAnswered({ councilTaxFrequency: 'other' })).toBe(true);
    });
  });

  describe('amount validator', () => {
    const validate = (value: unknown): boolean | string =>
      optionFor('weekly').subFields.councilTaxCostWeekly.validator(value);

    it('leaves an empty amount alone because the amount is optional', () => {
      expect(validate('')).toBe(true);
    });

    it('accepts an amount with pence', () => {
      expect(validate('12.50')).toBe(true);
    });

    it('returns the error key for the field matching the reason the amount is invalid', () => {
      expect(validate('not-a-number')).toBe('errors.councilTaxCostWeekly.invalid');
    });
  });

  describe('details validator', () => {
    const validate = (value: unknown): boolean | string =>
      optionFor('other').subFields.councilTaxFrequencyAndCostDetails.validator(value);

    it('accepts details within the length limit', () => {
      expect(validate('Paid quarterly')).toBe(true);
    });

    it('returns the max length error key when the details are too long', () => {
      expect(validate('a'.repeat(501))).toBe('errors.councilTaxFrequencyAndCostDetails.maxLength');
    });
  });

  describe('getInitialFormData', () => {
    const makeReq = (rentDetails?: Record<string, unknown>, formData: Record<string, unknown> = {}): Request =>
      ({
        params: { caseReference: CASE_REF },
        session: { formData: { [CASE_REF]: formData }, ccdCase: { rentDetails } },
      }) as unknown as Request;

    it('returns the saved details when other was chosen', () => {
      const req = makeReq({ councilTaxFrequency: 'other', councilTaxFrequencyAndCostDetails: 'Paid quarterly' });

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        councilTaxFrequency: 'other',
        [detailsField]: 'Paid quarterly',
      });
    });

    it('prefers details entered this session over the saved details', () => {
      const req = makeReq(
        { councilTaxFrequency: 'other', councilTaxFrequencyAndCostDetails: 'Paid quarterly' },
        { [stepName]: { councilTaxFrequency: 'other', [detailsField]: 'Paid twice a year' } }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        councilTaxFrequency: 'other',
        [detailsField]: 'Paid twice a year',
      });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(capturedConfig.getInitialFormData(makeReq())).toEqual({});
    });
  });
});
