import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/your-application/contact-preferences/text-updates/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';

describe('application text-updates step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (
    formData: Record<string, unknown> = {},
    applicantContactPreferences?: Record<string, unknown>
  ): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: formData }, ccdCase: { applicantContactPreferences } },
    }) as unknown as Request;

  describe('isAnswered', () => {
    const isAnswered = (applicantContactPreferences?: Record<string, unknown>): boolean =>
      capturedConfig.isAnswered(makeReq({}, applicantContactPreferences));

    it('is not answered when nothing has been saved', () => {
      expect(isAnswered()).toBe(false);
      expect(isAnswered({})).toBe(false);
    });

    it('is answered when the citizen does not want text updates', () => {
      expect(isAnswered({ contactByText: 'No' })).toBe(true);
    });

    it('is answered when the citizen wants text updates and gave a mobile number', () => {
      expect(isAnswered({ contactByText: 'Yes', mobilePhoneNumber: '07123 456789' })).toBe(true);
    });

    it('is not answered when the citizen wants text updates but the mobile number is missing or a landline', () => {
      expect(isAnswered({ contactByText: 'Yes' })).toBe(false);
      expect(isAnswered({ contactByText: 'Yes', mobilePhoneNumber: '01303 715342' })).toBe(false);
    });
  });

  describe('mobile number validator', () => {
    const validate = (value: unknown): boolean | string =>
      capturedConfig.fields[0].options[0].subFields.textUpdatesPhoneNumber.validator(value);

    it('leaves an empty value to the required check', () => {
      expect(validate('')).toBe(true);
    });

    it('accepts a mobile number', () => {
      expect(validate('07123 456789')).toBe(true);
    });

    it('returns the error key for a number that is not a mobile', () => {
      expect(validate('01303 715342')).toBe('errors.textUpdatesPhoneNumber');
    });
  });

  describe('getInitialFormData', () => {
    it('returns the answers from the form data', () => {
      const req = makeReq(
        { 'text-updates': { textUpdates: 'Yes', 'textUpdates.textUpdatesPhoneNumber': '07123 456789' } },
        { contactByText: 'No', mobilePhoneNumber: '07000 000000' }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        textUpdates: 'Yes',
        'textUpdates.textUpdatesPhoneNumber': '07123 456789',
      });
    });

    it('falls back to the saved case', () => {
      const req = makeReq({}, { contactByText: 'Yes', mobilePhoneNumber: '07123 456789' });

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        textUpdates: 'Yes',
        'textUpdates.textUpdatesPhoneNumber': '07123 456789',
      });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(capturedConfig.getInitialFormData(makeReq())).toEqual({});
    });
  });
});
