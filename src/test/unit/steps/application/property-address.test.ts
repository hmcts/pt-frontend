import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/the-property/property-address/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

describe('application property-address step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (ccdCase?: Record<string, unknown>): Request => ({ session: { ccdCase } }) as unknown as Request;

  const requiredParts = { addressLine1: '1 High Street', townOrCity: 'Leeds', postcode: 'LS1 1AA' };

  describe('isAnswered', () => {
    it('is not answered when nothing has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
      expect(capturedConfig.isAnswered(makeReq({}))).toBe(false);
    });

    it('is answered when the first line, town and postcode are saved', () => {
      expect(capturedConfig.isAnswered(makeReq(requiredParts))).toBe(true);
    });

    it.each(['addressLine1', 'townOrCity', 'postcode'])('is not answered when %s is missing', missing => {
      expect(capturedConfig.isAnswered(makeReq({ ...requiredParts, [missing]: undefined }))).toBe(false);
    });
  });

  describe('validators', () => {
    const validatorFor = (name: string): ((value: unknown) => boolean | string) =>
      capturedConfig.fields.find((field: { name: string }) => field.name === name).validator;

    it.each([
      ['addressLine1', 'errors.addressLine1.invalid'],
      ['addressLine2', 'errors.addressLine2.invalid'],
      ['townOrCity', 'errors.townOrCity.invalid'],
      ['county', 'errors.county.invalid'],
    ])('rejects a one character %s', (name, errorKey) => {
      expect(validatorFor(name)('ab')).toBe(true);
      expect(validatorFor(name)('a')).toBe(errorKey);
    });

    it('accepts a valid postcode and returns the error key for an invalid one', () => {
      expect(validatorFor('postcode')('LS1 1AA')).toBe(true);
      expect(validatorFor('postcode')('not a postcode')).toBe('errors.postcode.invalid');
    });
  });
});
