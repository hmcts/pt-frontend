import type { Request } from 'express';

import { createFormStep, getTranslationFunction } from '@modules/steps';

import './../../../../main/steps/application/the-rent/what-you-think-market-rent-should-be/proposed-market-rent/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
  getTranslationFunction: jest.fn(),
}));

const CASE_REF = '1234123412341234';

describe('application proposed-market-rent step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  describe('extendGetContent', () => {
    // The heading asks for the rent in the frequency given in the current rent section.
    const makeReq = (formData: Record<string, unknown> = {}, currentRentsDetails?: Record<string, unknown>): Request =>
      ({
        params: { caseReference: CASE_REF },
        session: { formData: { [CASE_REF]: formData }, ccdCase: { currentRentsDetails } },
      }) as unknown as Request;

    beforeEach(() => {
      // Echo the key back so assertions read as the key that was looked up.
      (getTranslationFunction as jest.Mock).mockReturnValue((key: string) => key);
    });

    it('resolves the frequency from the form data', () => {
      const req = makeReq({ 'rent-payment-frequency': { rentPaymentFrequency: 'weekly' } });

      expect(capturedConfig.extendGetContent(req)).toEqual({ frequency: 'frequency.weekly' });
    });

    it('falls back to the saved case when there is no form data', () => {
      const req = makeReq({}, { rentPaymentFrequency: 'yearly' });

      expect(capturedConfig.extendGetContent(req)).toEqual({ frequency: 'frequency.yearly' });
    });

    it('prefers the form data over the saved case', () => {
      const req = makeReq(
        { 'rent-payment-frequency': { rentPaymentFrequency: 'monthly' } },
        {
          rentPaymentFrequency: 'yearly',
        }
      );

      expect(capturedConfig.extendGetContent(req)).toEqual({ frequency: 'frequency.monthly' });
    });

    it('leaves the frequency out of the heading when it has not been answered', () => {
      expect(capturedConfig.extendGetContent(makeReq())).toEqual({ frequency: '' });
    });
  });

  // getRentAmountError has its own tests, so these cover the wiring rather than the rules.
  describe('validator', () => {
    const validate = (value: unknown): boolean | string => capturedConfig.fields[0].validator(value);

    it('leaves an empty value to the required check', () => {
      expect(validate('')).toBe(true);
    });

    it('accepts an amount with pence', () => {
      expect(validate('1200.50')).toBe(true);
    });

    it('returns the error key matching the reason the amount is invalid', () => {
      expect(validate('not-a-number')).toBe('errors.applicantSuggestedMarketRent.invalid');
    });
  });

  describe('getInitialFormData', () => {
    const makeReq = (formData: Record<string, unknown> = {}, marketRentDetails?: Record<string, unknown>): Request =>
      ({
        params: { caseReference: CASE_REF },
        session: { formData: { [CASE_REF]: formData }, ccdCase: { marketRentDetails } },
      }) as unknown as Request;

    it('returns the answer from the form data', () => {
      const req = makeReq({ 'proposed-market-rent': { applicantSuggestedMarketRent: '1200' } });

      expect(capturedConfig.getInitialFormData(req)).toEqual({ applicantSuggestedMarketRent: '1200' });
    });

    it('falls back to the saved case and returns it as a string', () => {
      const req = makeReq({}, { applicantSuggestedMarketRent: 900 });

      expect(capturedConfig.getInitialFormData(req)).toEqual({ applicantSuggestedMarketRent: '900.00' });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(capturedConfig.getInitialFormData(makeReq())).toEqual({});
    });

    it('shows pence to two decimal places when the saved amount has them', () => {
      const req = makeReq({}, { applicantSuggestedMarketRent: 120.5 });

      expect(capturedConfig.getInitialFormData(req)).toEqual({ applicantSuggestedMarketRent: '120.50' });
    });

    it('keeps a saved zero', () => {
      const req = makeReq({}, { applicantSuggestedMarketRent: 0 });

      expect(capturedConfig.getInitialFormData(req)).toEqual({ applicantSuggestedMarketRent: '0.00' });
    });
  });
});
