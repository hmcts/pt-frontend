import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/the-property/do-you-share-the-property-with-landlord/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const MAX_LENGTH = 500;

describe('application do-you-share-the-property-with-landlord step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (ccdCase?: Record<string, unknown>): Request => ({ session: { ccdCase } }) as unknown as Request;

  describe('isAnswered', () => {
    it('is not answered when nothing has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
      expect(capturedConfig.isAnswered(makeReq({}))).toBe(false);
    });

    it('is answered when the citizen does not share the property', () => {
      expect(capturedConfig.isAnswered(makeReq({ propertySharedWithLandlord: 'no' }))).toBe(true);
    });

    it('is answered when the citizen shares the property and said how', () => {
      const req = makeReq({
        propertySharedWithLandlord: 'yes',
        propertySharedWithLandlordDetails: 'We share the kitchen',
      });

      expect(capturedConfig.isAnswered(req)).toBe(true);
    });

    it('is not answered when the citizen shares the property but has not said how', () => {
      expect(capturedConfig.isAnswered(makeReq({ propertySharedWithLandlord: 'yes' }))).toBe(false);
    });

    it('is not answered when the saved details are longer than the limit', () => {
      const req = makeReq({
        propertySharedWithLandlord: 'yes',
        propertySharedWithLandlordDetails: 'a'.repeat(MAX_LENGTH + 1),
      });

      expect(capturedConfig.isAnswered(req)).toBe(false);
    });
  });

  describe('details validator', () => {
    const validate = (value: unknown): boolean | string =>
      capturedConfig.fields[0].options[0].subFields.propertySharedWithLandlordDetails.validator(value);

    it('accepts details up to the limit', () => {
      expect(validate('a'.repeat(MAX_LENGTH))).toBe(true);
    });

    it('returns the error key when the details are too long', () => {
      expect(validate('a'.repeat(MAX_LENGTH + 1))).toBe('errors.propertySharedWithLandlordDetails.invalid');
    });
  });
});
