import type { Request } from 'express';

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

  describe('getInitialFormData', () => {
    const INITIAL_CASE_REF = '1234123412341234';
    const makeInitialReq = (
      stepFormData: Record<string, unknown> = {},
      propertyDetails?: Record<string, unknown>
    ): Request =>
      ({
        params: { caseReference: INITIAL_CASE_REF },
        session: {
          formData: { [INITIAL_CASE_REF]: { ['indoor-features']: stepFormData } },
          ccdCase: propertyDetails ? { propertyDetails } : undefined,
        },
      }) as unknown as Request;
    const getInitialFormData = (req: Request) => capturedConfig.getInitialFormData(req);

    it('prefills the saved answer so the change link does not open a blank page', () => {
      expect(getInitialFormData(makeInitialReq({}, { indoorFeatures: 'Saved indoorFeatures' }))).toEqual({
        indoorFeatures: 'Saved indoorFeatures',
      });
    });

    it('prefers the answer in the session over the saved case', () => {
      const req = makeInitialReq({ indoorFeatures: 'From session' }, { indoorFeatures: 'Saved indoorFeatures' });

      expect(getInitialFormData(req)).toMatchObject({ indoorFeatures: 'From session' });
    });

    it('keeps a field the user cleared in the session blank', () => {
      const req = makeInitialReq({ indoorFeatures: '' }, { indoorFeatures: 'Saved indoorFeatures' });

      expect(getInitialFormData(req)).toEqual({});
    });

    it('returns nothing when the question has not been answered', () => {
      expect(getInitialFormData(makeInitialReq())).toEqual({});
    });
  });
});
