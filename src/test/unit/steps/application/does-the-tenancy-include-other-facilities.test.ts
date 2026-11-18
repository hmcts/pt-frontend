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

    it('is answered when the tenancy includes no other facilities', () => {
      expect(capturedConfig.isAnswered(makeReq({ otherFacilitiesAvailable: 'No' }))).toBe(true);
    });

    it('is answered when the tenancy includes other facilities and the citizen described them', () => {
      const req = makeReq({
        otherFacilitiesAvailable: 'Yes',
        otherFacilitiesDetails: 'A garage and a garden',
      });

      expect(capturedConfig.isAnswered(req)).toBe(true);
    });

    it('is not answered when the tenancy includes other facilities but they are not described', () => {
      expect(capturedConfig.isAnswered(makeReq({ otherFacilitiesAvailable: 'Yes' }))).toBe(false);
    });

    it('is not answered when the saved description is longer than the limit', () => {
      const req = makeReq({
        otherFacilitiesAvailable: 'Yes',
        otherFacilitiesDetails: 'a'.repeat(MAX_LENGTH + 1),
      });

      expect(capturedConfig.isAnswered(req)).toBe(false);
    });
  });

  describe('description validator', () => {
    const validate = (value: unknown): boolean | string =>
      capturedConfig.fields[0].options[0].subFields.otherFacilitiesDetails.validator(value);

    it('accepts a description up to the limit', () => {
      expect(validate('a'.repeat(MAX_LENGTH))).toBe(true);
    });

    it('returns the error key when the description is too long', () => {
      expect(validate('a'.repeat(MAX_LENGTH + 1))).toBe('errors.otherFacilitiesDetails.invalid');
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
          formData: { [INITIAL_CASE_REF]: { ['does-the-tenancy-include-other-facilities']: stepFormData } },
          ccdCase: propertyDetails ? { propertyDetails } : undefined,
        },
      }) as unknown as Request;
    const getInitialFormData = (req: Request) => capturedConfig.getInitialFormData(req);

    it('prefills the saved answer and details so the change link does not open a blank page', () => {
      expect(
        getInitialFormData(makeInitialReq({}, { otherFacilitiesAvailable: 'Yes', otherFacilitiesDetails: 'A garden' }))
      ).toEqual({
        otherFacilitiesAvailable: 'Yes',
        'otherFacilitiesAvailable.otherFacilitiesDetails': 'A garden',
      });
    });

    it('prefers the answer in the session over the saved case', () => {
      const req = makeInitialReq(
        { otherFacilitiesAvailable: 'Yes', 'otherFacilitiesAvailable.otherFacilitiesDetails': 'Changed in session' },
        { otherFacilitiesAvailable: 'Yes', otherFacilitiesDetails: 'A garden' }
      );

      expect(getInitialFormData(req)).toEqual({
        otherFacilitiesAvailable: 'Yes',
        'otherFacilitiesAvailable.otherFacilitiesDetails': 'Changed in session',
      });
    });

    it('does not bring back the saved details once the answer has changed', () => {
      const req = makeInitialReq(
        { otherFacilitiesAvailable: 'No' },
        { otherFacilitiesAvailable: 'Yes', otherFacilitiesDetails: 'A garden' }
      );

      expect(getInitialFormData(req)).toEqual({ otherFacilitiesAvailable: 'No' });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(getInitialFormData(makeInitialReq())).toEqual({});
    });
  });
});
