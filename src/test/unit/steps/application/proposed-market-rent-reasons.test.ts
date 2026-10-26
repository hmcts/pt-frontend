import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/the-rent/what-you-think-market-rent-should-be/proposed-market-rent-reasons/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';

const MAX_LENGTH = 5000;

describe('application proposed-market-rent-reasons step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (formData: Record<string, unknown> = {}, marketRentDetails?: Record<string, unknown>): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: formData }, ccdCase: { marketRentDetails } },
    }) as unknown as Request;

  // The answer is optional, so an empty string counts as answered and undefined does not.
  describe('isAnswered', () => {
    it('is not answered when the question has not been visited', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
    });

    it('is answered when the citizen gave reasons', () => {
      expect(
        capturedConfig.isAnswered(makeReq({}, { applicantSuggestedMarketRentReasons: 'Similar flats nearby' }))
      ).toBe(true);
    });

    it('is answered when the citizen left it blank', () => {
      expect(capturedConfig.isAnswered(makeReq({}, { applicantSuggestedMarketRentReasons: '' }))).toBe(true);
    });

    it('is not answered when the saved answer is longer than the column allows', () => {
      const req = makeReq({}, { applicantSuggestedMarketRentReasons: 'a'.repeat(MAX_LENGTH + 1) });

      expect(capturedConfig.isAnswered(req)).toBe(false);
    });
  });

  // textAreaIsValidLength has its own tests, so these cover the wiring rather than the rules.
  describe('validator', () => {
    const validate = (value: unknown): boolean | string => capturedConfig.fields[0].validator(value);

    it('accepts an empty value', () => {
      expect(validate('')).toBe(true);
    });

    it('accepts an answer up to the maximum length', () => {
      expect(validate('a'.repeat(MAX_LENGTH))).toBe(true);
    });

    it('returns the error key when the answer is too long', () => {
      expect(validate('a'.repeat(MAX_LENGTH + 1))).toBe('errors.applicantSuggestedMarketRentReasons.invalid');
    });
  });

  describe('getInitialFormData', () => {
    it('returns the answer from the form data', () => {
      const req = makeReq({ 'proposed-market-rent-reasons': { applicantSuggestedMarketRentReasons: 'From the form' } });

      expect(capturedConfig.getInitialFormData(req)).toEqual({ applicantSuggestedMarketRentReasons: 'From the form' });
    });

    it('falls back to the saved case', () => {
      const req = makeReq({}, { applicantSuggestedMarketRentReasons: 'From the case' });

      expect(capturedConfig.getInitialFormData(req)).toEqual({ applicantSuggestedMarketRentReasons: 'From the case' });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(capturedConfig.getInitialFormData(makeReq())).toEqual({});
    });
  });
});
