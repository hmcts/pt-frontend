import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/the-property/services-provided-tenancy/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const MAX_LENGTH = 500;

describe('application services-provided-tenancy step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (ccdCase?: Record<string, unknown>): Request => ({ session: { ccdCase } }) as unknown as Request;

  describe('isAnswered', () => {
    it('is not answered when nothing has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
      expect(capturedConfig.isAnswered(makeReq({}))).toBe(false);
    });

    it('is answered when no services are provided', () => {
      expect(capturedConfig.isAnswered(makeReq({ servicesProvided: 'no' }))).toBe(true);
    });

    it('is answered when services are provided and the citizen said which', () => {
      const req = makeReq({ servicesProvided: 'yes', servicesProvidedDetails: 'Cleaning of shared areas' });

      expect(capturedConfig.isAnswered(req)).toBe(true);
    });

    it('is not answered when services are provided but the citizen has not said which', () => {
      expect(capturedConfig.isAnswered(makeReq({ servicesProvided: 'yes' }))).toBe(false);
    });

    it('is not answered when the saved details are longer than the limit', () => {
      const req = makeReq({ servicesProvided: 'yes', servicesProvidedDetails: 'a'.repeat(MAX_LENGTH + 1) });

      expect(capturedConfig.isAnswered(req)).toBe(false);
    });
  });

  describe('details validator', () => {
    const validate = (value: unknown): boolean | string =>
      capturedConfig.fields[0].options[0].subFields.servicesProvidedDetails.validator(value);

    it('accepts details between 2 characters and the limit', () => {
      expect(validate('ab')).toBe(true);
      expect(validate('a'.repeat(MAX_LENGTH))).toBe(true);
    });

    it('returns the error key when the details are a single character', () => {
      expect(validate('a')).toBe('errors.servicesProvidedDetails.invalid');
    });

    it('returns the error key when the details are too long', () => {
      expect(validate('a'.repeat(MAX_LENGTH + 1))).toBe('errors.servicesProvidedDetails.invalid');
    });
  });
});
