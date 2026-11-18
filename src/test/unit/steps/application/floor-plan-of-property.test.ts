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

    it('is answered when the citizen has a floor plan', () => {
      expect(capturedConfig.isAnswered(makeReq({ propertyFloorPlanAvailable: 'Yes' }))).toBe(true);
    });

    it('is answered when the citizen has no floor plan and described the layout', () => {
      const req = makeReq({ propertyFloorPlanAvailable: 'No', floorPlanManualDetails: 'Two bedrooms upstairs' });

      expect(capturedConfig.isAnswered(req)).toBe(true);
    });

    it('is not answered when the citizen has no floor plan and left the optional layout description blank', () => {
      expect(capturedConfig.isAnswered(makeReq({ propertyFloorPlanAvailable: 'No' }))).toBe(false);
    });
  });

  describe('layout description validator', () => {
    const validate = (value: unknown): boolean | string =>
      capturedConfig.fields[0].options[1].subFields.floorPlanManualDetails.validator(value);

    it('accepts a description up to the limit', () => {
      expect(validate('a'.repeat(MAX_LENGTH))).toBe(true);
    });

    it('returns the error key when the description is too long', () => {
      expect(validate('a'.repeat(MAX_LENGTH + 1))).toBe('errors.floorPlanManualDetails.invalid');
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
          formData: { [INITIAL_CASE_REF]: { ['floor-plan-of-property']: stepFormData } },
          ccdCase: propertyDetails ? { propertyDetails } : undefined,
        },
      }) as unknown as Request;
    const getInitialFormData = (req: Request) => capturedConfig.getInitialFormData(req);

    it('prefills the saved answer and details so the change link does not open a blank page', () => {
      expect(
        getInitialFormData(
          makeInitialReq({}, { propertyFloorPlanAvailable: 'No', floorPlanManualDetails: 'Two bedrooms upstairs' })
        )
      ).toEqual({
        propertyFloorPlanAvailable: 'No',
        'propertyFloorPlanAvailable.floorPlanManualDetails': 'Two bedrooms upstairs',
      });
    });

    it('prefers the answer in the session over the saved case', () => {
      const req = makeInitialReq(
        { propertyFloorPlanAvailable: 'No', 'propertyFloorPlanAvailable.floorPlanManualDetails': 'Changed in session' },
        { propertyFloorPlanAvailable: 'No', floorPlanManualDetails: 'Two bedrooms upstairs' }
      );

      expect(getInitialFormData(req)).toEqual({
        propertyFloorPlanAvailable: 'No',
        'propertyFloorPlanAvailable.floorPlanManualDetails': 'Changed in session',
      });
    });

    it('does not bring back the saved details once the answer has changed', () => {
      const req = makeInitialReq(
        { propertyFloorPlanAvailable: 'Yes' },
        { propertyFloorPlanAvailable: 'No', floorPlanManualDetails: 'Two bedrooms upstairs' }
      );

      expect(getInitialFormData(req)).toEqual({ propertyFloorPlanAvailable: 'Yes' });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(getInitialFormData(makeInitialReq())).toEqual({});
    });
  });
});
