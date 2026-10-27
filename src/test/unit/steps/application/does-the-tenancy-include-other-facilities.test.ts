import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/the-property/does-the-tenancy-include-other-facilities/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const MAX_LENGTH = 500;

describe('application does-the-tenancy-include-other-facilities step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (ccdCase?: Record<string, unknown>): Request => ({ session: { ccdCase } }) as unknown as Request;

  describe('isAnswered', () => {
    it('is not answered when nothing has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
      expect(capturedConfig.isAnswered(makeReq({}))).toBe(false);
    });

    it('is answered when the tenancy includes no other facilities', () => {
      expect(capturedConfig.isAnswered(makeReq({ propertyIncludesOtherFacilities: 'no' }))).toBe(true);
    });

    it('is answered when the tenancy includes other facilities and the citizen described them', () => {
      const req = makeReq({
        propertyIncludesOtherFacilities: 'yes',
        propertyFacilitiesDescription: 'A garage and a garden',
      });

      expect(capturedConfig.isAnswered(req)).toBe(true);
    });

    it('is not answered when the tenancy includes other facilities but they are not described', () => {
      expect(capturedConfig.isAnswered(makeReq({ propertyIncludesOtherFacilities: 'yes' }))).toBe(false);
    });

    it('is not answered when the saved description is longer than the limit', () => {
      const req = makeReq({
        propertyIncludesOtherFacilities: 'yes',
        propertyFacilitiesDescription: 'a'.repeat(MAX_LENGTH + 1),
      });

      expect(capturedConfig.isAnswered(req)).toBe(false);
    });
  });

  describe('description validator', () => {
    const validate = (value: unknown): boolean | string =>
      capturedConfig.fields[0].options[0].subFields.propertyFacilitiesDescription.validator(value);

    it('accepts a description up to the limit', () => {
      expect(validate('a'.repeat(MAX_LENGTH))).toBe(true);
    });

    it('returns the error key when the description is too long', () => {
      expect(validate('a'.repeat(MAX_LENGTH + 1))).toBe('errors.propertyFacilitiesDescription.invalid');
    });
  });
});
