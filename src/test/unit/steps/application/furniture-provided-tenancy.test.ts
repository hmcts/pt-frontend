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

  const makeReq = (propertyDetails?: Record<string, unknown>): Request =>
    ({
      session: {
        ccdCase: propertyDetails ? { propertyDetails } : undefined,
      },
    }) as unknown as Request;

  describe('isAnswered', () => {
    it('is not answered when nothing has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
      expect(capturedConfig.isAnswered(makeReq({}))).toBe(false);
    });

    it('is answered when no furniture is provided', () => {
      const myReq = makeReq({ furnitureProvidedInTenancy: 'No' });
      expect(capturedConfig.isAnswered(myReq)).toBe(true);
    });

    it('is answered when furniture is provided and the citizen said what', () => {
      const req = makeReq({ furnitureProvidedInTenancy: 'Yes', furnitureProvidedInTenancyDetails: 'A bed and a sofa' });

      expect(capturedConfig.isAnswered(req)).toBe(true);
    });

    it('is not answered when furniture is provided but the citizen has not said what', () => {
      expect(capturedConfig.isAnswered(makeReq({ furnitureProvidedInTenancy: 'Yes' }))).toBe(false);
    });

    it('is not answered when the saved details are longer than the limit', () => {
      const req = makeReq({
        furnitureProvidedInTenancy: 'Yes',
        furnitureProvidedInTenancyDetails: 'a'.repeat(MAX_LENGTH + 1),
      });

      expect(capturedConfig.isAnswered(req)).toBe(false);
    });
  });

  describe('details validator', () => {
    const validate = (value: unknown): boolean | string =>
      capturedConfig.fields[0].options[0].subFields.furnitureProvidedInTenancyDetails.validator(value);

    it('accepts details between 2 characters and the limit', () => {
      expect(validate('ab')).toBe(true);
      expect(validate('a'.repeat(MAX_LENGTH))).toBe(true);
    });

    it('returns the error key when the details are a single character', () => {
      expect(validate('a')).toBe('errors.furnitureProvidedInTenancyDetails.invalid');
    });

    it('returns the error key when the details are too long', () => {
      expect(validate('a'.repeat(MAX_LENGTH + 1))).toBe('errors.furnitureProvidedInTenancyDetails.invalid');
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
          formData: { [INITIAL_CASE_REF]: { ['furniture-provided-tenancy']: stepFormData } },
          ccdCase: propertyDetails ? { propertyDetails } : undefined,
        },
      }) as unknown as Request;
    const getInitialFormData = (req: Request) => capturedConfig.getInitialFormData(req);

    it('prefills the saved answer and details so the change link does not open a blank page', () => {
      expect(
        getInitialFormData(
          makeInitialReq(
            {},
            { furnitureProvidedInTenancy: 'Yes', furnitureProvidedInTenancyDetails: 'A sofa and a bed' }
          )
        )
      ).toEqual({
        furnitureProvidedInTenancy: 'Yes',
        'furnitureProvidedInTenancy.furnitureProvidedInTenancyDetails': 'A sofa and a bed',
      });
    });

    it('prefers the answer in the session over the saved case', () => {
      const req = makeInitialReq(
        {
          furnitureProvidedInTenancy: 'Yes',
          'furnitureProvidedInTenancy.furnitureProvidedInTenancyDetails': 'Changed in session',
        },
        { furnitureProvidedInTenancy: 'Yes', furnitureProvidedInTenancyDetails: 'A sofa and a bed' }
      );

      expect(getInitialFormData(req)).toEqual({
        furnitureProvidedInTenancy: 'Yes',
        'furnitureProvidedInTenancy.furnitureProvidedInTenancyDetails': 'Changed in session',
      });
    });

    it('does not bring back the saved details once the answer has changed', () => {
      const req = makeInitialReq(
        { furnitureProvidedInTenancy: 'No' },
        { furnitureProvidedInTenancy: 'Yes', furnitureProvidedInTenancyDetails: 'A sofa and a bed' }
      );

      expect(getInitialFormData(req)).toEqual({ furnitureProvidedInTenancy: 'No' });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(getInitialFormData(makeInitialReq())).toEqual({});
    });
  });
});
