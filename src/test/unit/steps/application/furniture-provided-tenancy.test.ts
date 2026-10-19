import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/the-property/furniture-provided-tenancy/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const MAX_LENGTH = 500;

describe('application furniture-provided-tenancy step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (ccdCase?: Record<string, unknown>): Request => ({ session: { ccdCase } }) as unknown as Request;

  describe('isAnswered', () => {
    it('is not answered when nothing has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
      expect(capturedConfig.isAnswered(makeReq({}))).toBe(false);
    });

    it('is answered when no furniture is provided', () => {
      expect(capturedConfig.isAnswered(makeReq({ furnitureProvided: 'no' }))).toBe(true);
    });

    it('is answered when furniture is provided and the citizen said what', () => {
      const req = makeReq({ furnitureProvided: 'yes', furnitureProvidedDetails: 'A bed and a sofa' });

      expect(capturedConfig.isAnswered(req)).toBe(true);
    });

    it('is not answered when furniture is provided but the citizen has not said what', () => {
      expect(capturedConfig.isAnswered(makeReq({ furnitureProvided: 'yes' }))).toBe(false);
    });

    it('is not answered when the saved details are longer than the limit', () => {
      const req = makeReq({ furnitureProvided: 'yes', furnitureProvidedDetails: 'a'.repeat(MAX_LENGTH + 1) });

      expect(capturedConfig.isAnswered(req)).toBe(false);
    });
  });

  describe('details validator', () => {
    const validate = (value: unknown): boolean | string =>
      capturedConfig.fields[0].options[0].subFields.furnitureProvidedDetails.validator(value);

    it('accepts details between 2 characters and the limit', () => {
      expect(validate('ab')).toBe(true);
      expect(validate('a'.repeat(MAX_LENGTH))).toBe(true);
    });

    it('returns the error key when the details are a single character', () => {
      expect(validate('a')).toBe('errors.furnitureProvidedDetails.invalid');
    });

    it('returns the error key when the details are too long', () => {
      expect(validate('a'.repeat(MAX_LENGTH + 1))).toBe('errors.furnitureProvidedDetails.invalid');
    });
  });
});
