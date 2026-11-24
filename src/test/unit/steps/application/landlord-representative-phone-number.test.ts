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
});
