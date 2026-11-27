import { createFormStep } from '@modules/steps';

import '../../../../main/steps/application/landlord-details/landlord-representative-email-address/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

describe('application landlord-representative-email-address step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  describe('validator', () => {
    const validate = (value: unknown): boolean | string => capturedConfig.fields[0].validator(value);

    it('accepts a valid email address', () => {
      expect(validate('name@example.co.uk')).toBe(true);
    });

    it('returns the invalid error key for an email address in the wrong format', () => {
      expect(validate('name.example.com')).toBe('errors.representativeEmailAddress.invalid');
    });
  });

  describe('getInitialFormData', () => {
    const CASE_REF = '1234123412341234';

    it('pre-populates the field from the case', () => {
      const req = {
        params: { caseReference: CASE_REF },
        session: {
          formData: {},
          ccdCase: { landlordDetails: { representative: { emailAddress: 'agent@example.com' } } },
        },
      };

      expect(capturedConfig.getInitialFormData(req)).toEqual({ representativeEmailAddress: 'agent@example.com' });
    });

    it('prefers saved form data over the case value', () => {
      const req = {
        params: { caseReference: CASE_REF },
        session: {
          formData: {
            [CASE_REF]: { 'landlord-representative-email-address': { representativeEmailAddress: 'amended' } },
          },
          ccdCase: { landlordDetails: { representative: { emailAddress: 'agent@example.com' } } },
        },
      };

      expect(capturedConfig.getInitialFormData(req)).toEqual({ representativeEmailAddress: 'amended' });
    });

    it('returns an empty object when nothing is saved', () => {
      const req = { params: { caseReference: CASE_REF }, session: { formData: {}, ccdCase: {} } };

      expect(capturedConfig.getInitialFormData(req)).toEqual({});
    });
  });
});
