import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/the-property/what-repairs-tenant-responsibility/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const MAX_LENGTH = 500;

describe('application what-repairs-tenant-responsibility step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (propertyDetails?: Record<string, unknown>): Request =>
    ({ session: { ccdCase: { propertyDetails } } }) as unknown as Request;

  describe('isAnswered', () => {
    it('is not answered when nothing has been saved', () => {
      expect(capturedConfig.isAnswered({ session: {} } as unknown as Request)).toBe(false);
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
      expect(capturedConfig.isAnswered(makeReq({}))).toBe(false);
    });

    it('is answered when the citizen described the repairs', () => {
      expect(capturedConfig.isAnswered(makeReq({ tenantRepairsDetails: 'Decorating and the garden' }))).toBe(true);
    });

    it('is answered when the citizen left the optional answer blank', () => {
      expect(capturedConfig.isAnswered(makeReq({ tenantRepairsDetails: '' }))).toBe(true);
    });

    it('is not answered when the saved answer is longer than the limit', () => {
      expect(capturedConfig.isAnswered(makeReq({ tenantRepairsDetails: 'a'.repeat(MAX_LENGTH + 1) }))).toBe(false);
    });
  });

  describe('validator', () => {
    const validate = (value: unknown): boolean | string => capturedConfig.fields[0].validator(value);

    it('accepts an answer up to the limit', () => {
      expect(validate('a'.repeat(MAX_LENGTH))).toBe(true);
    });

    it('returns the error key when the answer is too long', () => {
      expect(validate('a'.repeat(MAX_LENGTH + 1))).toBe('errors.tenantRepairsDetails.invalid');
    });
  });
});
