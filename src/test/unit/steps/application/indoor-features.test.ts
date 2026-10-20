import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/the-property/indoor-features/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const MAX_LENGTH = 500;

describe('application indoor-features step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  describe('validator', () => {
    const validate = (value: unknown): boolean | string => capturedConfig.fields[0].validator(value);

    it('accepts a description up to the limit', () => {
      expect(validate('a'.repeat(MAX_LENGTH))).toBe(true);
    });

    it('returns the error key when the description is too long', () => {
      expect(validate('a'.repeat(MAX_LENGTH + 1))).toBe('errors.indoorFeatures.invalid');
    });
  });
});
