import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/your-application/contact-preferences/contact-by-phone/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';

describe('application contact-by-phone step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (
    formData: Record<string, unknown> = {},
    applicantContactPreferences?: Record<string, unknown>
  ): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: formData }, ccdCase: { applicantContactPreferences } },
    }) as unknown as Request;

  it('is always answered because the phone number is optional', () => {
    expect(capturedConfig.isAnswered(makeReq())).toBe(true);
  });

  describe('phone number validator', () => {
    const validate = (value: unknown): boolean | string => capturedConfig.fields[0].validator(value);

    it('accepts an empty value', () => {
      expect(validate('')).toBe(true);
    });

    it('accepts a valid phone number', () => {
      expect(validate('01303 715342')).toBe(true);
    });

    it('returns the invalid error key for an invalid phone number', () => {
      expect(validate('07l23456789')).toBe('errors.phoneNumberForCalls.invalid');
    });
  });

  describe('getInitialFormData', () => {
    it('returns the phone number from the form data', () => {
      const req = makeReq(
        { 'contact-by-phone': { phoneNumberForCalls: '01303 715342' } },
        { phoneNumber: '07123 456789' }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({ phoneNumberForCalls: '01303 715342' });
    });

    it('falls back to the saved case', () => {
      const req = makeReq({}, { phoneNumber: '07123 456789' });

      expect(capturedConfig.getInitialFormData(req)).toEqual({ phoneNumberForCalls: '07123 456789' });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(capturedConfig.getInitialFormData(makeReq())).toEqual({});
    });
  });
});
