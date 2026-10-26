import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import '../../../../main/steps/application/landlord-details/landlord-representative-phone-number/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

describe('application landlord-representative-phone-number step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (ccdCase: Record<string, unknown> = {}): Request => ({ session: { ccdCase } }) as unknown as Request;

  describe('isAnswered', () => {
    it('is not answered when no phone number has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
    });

    it('is answered when a valid phone number has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq({ representativePhoneNumber: '07123 456789' }))).toBe(true);
    });

    it('is not answered when the saved phone number is not valid', () => {
      expect(capturedConfig.isAnswered(makeReq({ representativePhoneNumber: 'invalid' }))).toBe(false);
    });
  });

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
