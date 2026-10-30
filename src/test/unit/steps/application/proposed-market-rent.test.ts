import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/the-rent/what-you-think-market-rent-should-be/proposed-market-rent/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';
const OTHER_KEY = 'applicantSuggestedMarketRentFrequency.applicantSuggestedMarketRentFrequencyOther';

describe('application proposed-market-rent step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (formData: Record<string, unknown> = {}, marketRentDetails?: Record<string, unknown>): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: formData }, ccdCase: { marketRentDetails } },
    }) as unknown as Request;

  describe('isAnswered', () => {
    const isAnswered = (marketRentDetails?: Record<string, unknown>): boolean =>
      capturedConfig.isAnswered({ session: { ccdCase: { marketRentDetails } } } as unknown as Request);

    it('is not answered when nothing has been saved', () => {
      expect(isAnswered()).toBe(false);
    });

    it('is not answered when only the amount has been saved', () => {
      expect(isAnswered({ applicantSuggestedMarketRent: 900 })).toBe(false);
    });

    it('is not answered when only the frequency has been saved', () => {
      expect(isAnswered({ applicantSuggestedMarketRentFrequency: 'monthly' })).toBe(false);
    });

    it('is answered when an amount and a frequency have been saved', () => {
      expect(isAnswered({ applicantSuggestedMarketRent: 900, applicantSuggestedMarketRentFrequency: 'monthly' })).toBe(
        true
      );
    });

    it('is answered when the saved amount is zero', () => {
      expect(isAnswered({ applicantSuggestedMarketRent: 0, applicantSuggestedMarketRentFrequency: 'weekly' })).toBe(
        true
      );
    });

    it('is not answered when other has been saved without its details', () => {
      expect(
        isAnswered({
          applicantSuggestedMarketRent: 900,
          applicantSuggestedMarketRentFrequency: 'other',
          applicantSuggestedMarketRentFrequencyOther: null,
        })
      ).toBe(false);
    });

    it('is answered when other has been saved with its details', () => {
      expect(
        isAnswered({
          applicantSuggestedMarketRent: 900,
          applicantSuggestedMarketRentFrequency: 'other',
          applicantSuggestedMarketRentFrequencyOther: 'Every 4 weeks',
        })
      ).toBe(true);
    });
  });

  // getRentAmountError has its own tests, so these cover the wiring rather than the rules.
  describe('amount validator', () => {
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

  describe('other validator', () => {
    const validate = (value: unknown): boolean | string =>
      capturedConfig.fields[1].options[4].subFields.applicantSuggestedMarketRentFrequencyOther.validator(value);

    it('accepts details within the limits', () => {
      expect(validate('Every 4 weeks')).toBe(true);
    });

    it('returns the error key matching the reason the details are invalid', () => {
      expect(validate('a')).toBe('errors.applicantSuggestedMarketRentFrequencyOther.tooShort');
    });
  });

  describe('beforeRedirect', () => {
    it('clears the other details when other is not selected', () => {
      const req = makeReq({
        'proposed-market-rent': { applicantSuggestedMarketRentFrequency: 'weekly', [OTHER_KEY]: 'Every 4 weeks' },
      });

      capturedConfig.beforeRedirect(req);

      expect(req.session.formData?.[CASE_REF]['proposed-market-rent'][OTHER_KEY]).toBe('');
    });

    it('keeps the other details when other is selected', () => {
      const req = makeReq({
        'proposed-market-rent': { applicantSuggestedMarketRentFrequency: 'other', [OTHER_KEY]: 'Every 4 weeks' },
      });

      capturedConfig.beforeRedirect(req);

      expect(req.session.formData?.[CASE_REF]['proposed-market-rent'][OTHER_KEY]).toBe('Every 4 weeks');
    });
  });

  describe('getInitialFormData', () => {
    it('returns the answers from the form data', () => {
      const req = makeReq({
        'proposed-market-rent': {
          applicantSuggestedMarketRent: '1200',
          applicantSuggestedMarketRentFrequency: 'other',
          [OTHER_KEY]: 'Every 4 weeks',
        },
      });

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        applicantSuggestedMarketRent: '1200',
        applicantSuggestedMarketRentFrequency: 'other',
        [OTHER_KEY]: 'Every 4 weeks',
      });
    });

    it('falls back to the saved case and returns the amount as a string', () => {
      const req = makeReq(
        {},
        {
          applicantSuggestedMarketRent: 900,
          applicantSuggestedMarketRentFrequency: 'other',
          applicantSuggestedMarketRentFrequencyOther: 'Every 4 weeks',
        }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        applicantSuggestedMarketRent: '900.00',
        applicantSuggestedMarketRentFrequency: 'other',
        [OTHER_KEY]: 'Every 4 weeks',
      });
    });

    it('leaves out saved other details once a different frequency is chosen', () => {
      const req = makeReq(
        { 'proposed-market-rent': { applicantSuggestedMarketRentFrequency: 'monthly' } },
        { applicantSuggestedMarketRentFrequency: 'other', applicantSuggestedMarketRentFrequencyOther: 'Every 4 weeks' }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({ applicantSuggestedMarketRentFrequency: 'monthly' });
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
