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

    it('is answered when no services are provided', () => {
      expect(capturedConfig.isAnswered(makeReq({ additionalServicesProvidedInTenancy: 'No' }))).toBe(true);
    });

    it('is answered when services are provided and the citizen said which', () => {
      const req = makeReq({
        additionalServicesProvidedInTenancy: 'Yes',
        additionalServicesProvidedInTenancyDetails: 'Cleaning of shared areas',
      });

      expect(capturedConfig.isAnswered(req)).toBe(true);
    });

    it('is not answered when services are provided but the citizen has not said which', () => {
      expect(capturedConfig.isAnswered(makeReq({ additionalServicesProvidedInTenancy: 'Yes' }))).toBe(false);
    });

    it('is not answered when the saved details are longer than the limit', () => {
      const req = makeReq({
        additionalServicesProvidedInTenancy: 'Yes',
        additionalServicesProvidedInTenancyDetails: 'a'.repeat(MAX_LENGTH + 1),
      });

      expect(capturedConfig.isAnswered(req)).toBe(false);
    });
  });

  describe('details validator', () => {
    const validate = (value: unknown): boolean | string =>
      capturedConfig.fields[0].options[0].subFields.additionalServicesProvidedInTenancyDetails.validator(value);

    it('accepts details between 2 characters and the limit', () => {
      expect(validate('ab')).toBe(true);
      expect(validate('a'.repeat(MAX_LENGTH))).toBe(true);
    });

    it('returns the error key when the details are a single character', () => {
      expect(validate('a')).toBe('errors.additionalServicesProvidedInTenancyDetails.invalid');
    });

    it('returns the error key when the details are too long', () => {
      expect(validate('a'.repeat(MAX_LENGTH + 1))).toBe('errors.additionalServicesProvidedInTenancyDetails.invalid');
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
          formData: { [INITIAL_CASE_REF]: { ['services-provided-tenancy']: stepFormData } },
          ccdCase: propertyDetails ? { propertyDetails } : undefined,
        },
      }) as unknown as Request;
    const getInitialFormData = (req: Request) => capturedConfig.getInitialFormData(req);

    it('prefills the saved answer and details so the change link does not open a blank page', () => {
      expect(
        getInitialFormData(
          makeInitialReq(
            {},
            {
              additionalServicesProvidedInTenancy: 'Yes',
              additionalServicesProvidedInTenancyDetails: 'Weekly cleaning',
            }
          )
        )
      ).toEqual({
        additionalServicesProvidedInTenancy: 'Yes',
        'additionalServicesProvidedInTenancy.additionalServicesProvidedInTenancyDetails': 'Weekly cleaning',
      });
    });

    it('prefers the answer in the session over the saved case', () => {
      const req = makeInitialReq(
        {
          additionalServicesProvidedInTenancy: 'Yes',
          'additionalServicesProvidedInTenancy.additionalServicesProvidedInTenancyDetails': 'Changed in session',
        },
        { additionalServicesProvidedInTenancy: 'Yes', additionalServicesProvidedInTenancyDetails: 'Weekly cleaning' }
      );

      expect(getInitialFormData(req)).toEqual({
        additionalServicesProvidedInTenancy: 'Yes',
        'additionalServicesProvidedInTenancy.additionalServicesProvidedInTenancyDetails': 'Changed in session',
      });
    });

    it('does not bring back the saved details once the answer has changed', () => {
      const req = makeInitialReq(
        { additionalServicesProvidedInTenancy: 'No' },
        { additionalServicesProvidedInTenancy: 'Yes', additionalServicesProvidedInTenancyDetails: 'Weekly cleaning' }
      );

      expect(getInitialFormData(req)).toEqual({ additionalServicesProvidedInTenancy: 'No' });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(getInitialFormData(makeInitialReq())).toEqual({});
    });
  });
});
