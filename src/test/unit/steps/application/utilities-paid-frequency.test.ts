import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import '../../../../main/steps/application/the-rent/the-current-rent-and-other-costs/utilities-paid-frequency';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';

describe('application utilities-paid-frequency step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];
  const stepName = 'utilities-paid-frequency';
  const weeklyField = 'utilitiesPaidFrequency.utilitiesPaidCostWeekly';
  const fortnightlyField = 'utilitiesPaidFrequency.utilitiesPaidCostFortnightly';
  const monthlyField = 'utilitiesPaidFrequency.utilitiesPaidCostMonthly';
  const yearlyField = 'utilitiesPaidFrequency.utilitiesPaidCostYearly';
  const detailsField = 'utilitiesPaidFrequency.utilitiesPaidFrequencyAndCostDetails';

  const makeReq = (formData: Record<string, unknown> = {}, currentRentsDetails?: Record<string, unknown>): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: formData }, ccdCase: { currentRentsDetails } },
    }) as unknown as Request;

  const optionFor = (value: string) =>
    capturedConfig.fields[0].options.find((option: { value: string }) => option.value === value);

  describe('isAnswered', () => {
    it('is not answered when no frequency has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
    });

    it('is answered when a frequency has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq({}, { utilitiesPaidFrequency: 'monthly' }))).toBe(true);
    });
  });

  describe('beforeRedirect', () => {
    const submitted = {
      [weeklyField]: '20',
      [fortnightlyField]: '40',
      [monthlyField]: '80',
      [yearlyField]: '960',
      [detailsField]: 'Paid with the rent',
    };

    it('keeps only the amount for the selected frequency', () => {
      const req = makeReq({ [stepName]: { utilitiesPaidFrequency: 'monthly', ...submitted } });

      capturedConfig.beforeRedirect(req);

      expect(req.session.formData?.[CASE_REF][stepName]).toEqual({
        utilitiesPaidFrequency: 'monthly',
        [weeklyField]: '',
        [fortnightlyField]: '',
        [monthlyField]: '80',
        [yearlyField]: '',
        [detailsField]: '',
      });
    });

    it('clears every amount and keeps the details when other is selected', () => {
      const req = makeReq({ [stepName]: { utilitiesPaidFrequency: 'other', ...submitted } });

      capturedConfig.beforeRedirect(req);

      expect(req.session.formData?.[CASE_REF][stepName]).toEqual({
        utilitiesPaidFrequency: 'other',
        [weeklyField]: '',
        [fortnightlyField]: '',
        [monthlyField]: '',
        [yearlyField]: '',
        [detailsField]: 'Paid with the rent',
      });
    });
  });

  describe('amount validator', () => {
    const validate = (value: unknown): boolean | string =>
      optionFor('weekly').subFields.utilitiesPaidCostWeekly.validator(value);

    it('leaves an empty amount alone because the amount is optional', () => {
      expect(validate('')).toBe(true);
    });

    it('accepts an amount with pence', () => {
      expect(validate('20.50')).toBe(true);
    });

    it('returns the error key for the field matching the reason the amount is invalid', () => {
      expect(validate('not-a-number')).toBe('errors.utilitiesPaidCostWeekly.invalid');
    });
  });

  describe('details validator', () => {
    const validate = (value: unknown): boolean | string =>
      optionFor('other').subFields.utilitiesPaidFrequencyAndCostDetails.validator(value);

    it('accepts details within the length limit', () => {
      expect(validate('Paid with the rent')).toBe(true);
    });

    it('returns the max length error key when the details are too long', () => {
      expect(validate('a'.repeat(501))).toBe('errors.utilitiesPaidFrequencyAndCostDetails.maxLength');
    });
  });

  describe('getInitialFormData', () => {
    it('returns the saved details when other was chosen', () => {
      const req = makeReq(
        {},
        { utilitiesPaidFrequency: 'other', utilitiesPaidFrequencyAndCostDetails: 'Paid with the rent' }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        utilitiesPaidFrequency: 'other',
        [detailsField]: 'Paid with the rent',
      });
    });

    it('prefers details entered this session over the saved details', () => {
      const req = makeReq(
        { [stepName]: { utilitiesPaidFrequency: 'other', [detailsField]: 'Paid twice a year' } },
        { utilitiesPaidFrequency: 'other', utilitiesPaidFrequencyAndCostDetails: 'Paid with the rent' }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        utilitiesPaidFrequency: 'other',
        [detailsField]: 'Paid twice a year',
      });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(capturedConfig.getInitialFormData(makeReq())).toEqual({});
    });
  });
});
