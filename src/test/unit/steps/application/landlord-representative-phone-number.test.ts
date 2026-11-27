import { createFormStep } from '@modules/steps';

import '../../../../main/steps/application/landlord-details/landlord-representative-phone-number/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

describe('application landlord-representative-phone-number step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  describe('validator', () => {
    const validate = (value: unknown): boolean | string => capturedConfig.fields[0].validator(value);

    it('accepts a valid phone number', () => {
      expect(validate('01303 715342')).toBe(true);
    });

    it('returns the invalid error key for a phone number in the wrong format', () => {
      expect(validate('07l23456789')).toBe('errors.representativePhoneNumber.invalid');
    });
  });

  describe('getInitialFormData', () => {
    const CASE_REF = '1234123412341234';

    it('pre-populates the field from the case', () => {
      const req = {
        params: { caseReference: CASE_REF },
        session: { formData: {}, ccdCase: { landlordDetails: { representative: { phoneNumber: '07123 456789' } } } },
      };

      expect(capturedConfig.getInitialFormData(req)).toEqual({ representativePhoneNumber: '07123 456789' });
    });

    it('prefers saved form data over the case value', () => {
      const req = {
        params: { caseReference: CASE_REF },
        session: {
          formData: {
            [CASE_REF]: { 'landlord-representative-phone-number': { representativePhoneNumber: 'amended' } },
          },
          ccdCase: { landlordDetails: { representative: { phoneNumber: '07123 456789' } } },
        },
      };

      expect(capturedConfig.getInitialFormData(req)).toEqual({ representativePhoneNumber: 'amended' });
    });

    it('returns an empty object when nothing is saved', () => {
      const req = { params: { caseReference: CASE_REF }, session: { formData: {}, ccdCase: {} } };

      expect(capturedConfig.getInitialFormData(req)).toEqual({});
    });
  });
});
