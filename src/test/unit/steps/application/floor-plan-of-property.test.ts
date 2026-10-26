import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/the-property/floor-plan-of-property/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const MAX_LENGTH = 500;

describe('application floor-plan-of-property step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (ccdCase?: Record<string, unknown>): Request => ({ session: { ccdCase } }) as unknown as Request;

  describe('isAnswered', () => {
    it('is not answered when nothing has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
      expect(capturedConfig.isAnswered(makeReq({}))).toBe(false);
    });

    it('is answered when the citizen has a floor plan', () => {
      expect(capturedConfig.isAnswered(makeReq({ hasFloorPlanOfProperty: 'yes' }))).toBe(true);
    });

    it('is answered when the citizen has no floor plan and described the layout', () => {
      const req = makeReq({ hasFloorPlanOfProperty: 'no', propertyLayoutDescription: 'Two bedrooms upstairs' });

      expect(capturedConfig.isAnswered(req)).toBe(true);
    });

    it('is not answered when the citizen has no floor plan and left the optional layout description blank', () => {
      expect(capturedConfig.isAnswered(makeReq({ hasFloorPlanOfProperty: 'no' }))).toBe(false);
    });
  });

  describe('layout description validator', () => {
    const validate = (value: unknown): boolean | string =>
      capturedConfig.fields[0].options[1].subFields.propertyLayoutDescription.validator(value);

    it('accepts a description up to the limit', () => {
      expect(validate('a'.repeat(MAX_LENGTH))).toBe(true);
    });

    it('returns the error key when the description is too long', () => {
      expect(validate('a'.repeat(MAX_LENGTH + 1))).toBe('errors.propertyLayoutDescription.invalid');
    });
  });
});
