import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import '../../../../main/steps/application/the-rent/the-current-rent-and-other-costs/additional-rental-service-charges-vary';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';

describe('application additional-rental-service-charges-vary step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];
  const stepName = 'additional-rental-service-charges-vary';
  const detailsField = 'additionalRentalServiceChargesVary.varyingAdditionalRentalServiceChargesDetails';

  const makeReq = (formData: Record<string, unknown> = {}, rentDetails?: Record<string, unknown>): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: formData }, ccdCase: { rentDetails } },
    }) as unknown as Request;

  describe('isAnswered', () => {
    const isAnswered = (rentDetails?: Record<string, unknown>): boolean =>
      capturedConfig.isAnswered(makeReq({}, rentDetails));

    it('is not answered when nothing has been saved', () => {
      expect(isAnswered()).toBe(false);
    });

    it('is answered when the charges do not vary', () => {
      expect(isAnswered({ additionalRentalServiceChargesVary: 'No' })).toBe(true);
    });

    it('is answered when the charges vary and the details have been saved', () => {
      expect(
        isAnswered({
          additionalRentalServiceChargesVary: 'Yes',
          varyingAdditionalRentalServiceChargesDetails: 'The service charge goes up each April',
        })
      ).toBe(true);
    });

    it('is not answered when the charges vary but no details have been saved', () => {
      expect(isAnswered({ additionalRentalServiceChargesVary: 'Yes' })).toBe(false);
    });
  });

  describe('beforeRedirect', () => {
    it('clears the details when the charges do not vary', () => {
      const req = makeReq({
        [stepName]: { additionalRentalServiceChargesVary: 'No', [detailsField]: 'Left over from a Yes answer' },
      });

      capturedConfig.beforeRedirect(req);

      expect(req.session.formData?.[CASE_REF][stepName]).toEqual({
        additionalRentalServiceChargesVary: 'No',
        [detailsField]: '',
      });
    });

    it('keeps the details when the charges vary', () => {
      const req = makeReq({
        [stepName]: {
          additionalRentalServiceChargesVary: 'Yes',
          [detailsField]: 'The service charge goes up each April',
        },
      });

      capturedConfig.beforeRedirect(req);

      expect(req.session.formData?.[CASE_REF][stepName][detailsField]).toBe('The service charge goes up each April');
    });
  });

  describe('details validator', () => {
    const validate = (value: unknown): boolean | string =>
      capturedConfig.fields[0].options[0].subFields.varyingAdditionalRentalServiceChargesDetails.validator(value);

    it('accepts details within the length limit', () => {
      expect(validate('The service charge goes up each April')).toBe(true);
    });

    it('returns the invalid error key when the details are too long', () => {
      expect(validate('a'.repeat(501))).toBe('errors.varyingAdditionalRentalServiceChargesDetails.invalid');
    });
  });

  describe('getInitialFormData', () => {
    it('prefers the answer and details from the form data over the saved case', () => {
      const req = makeReq(
        { [stepName]: { additionalRentalServiceChargesVary: 'Yes', [detailsField]: 'Typed this session' } },
        { additionalRentalServiceChargesVary: 'Yes', varyingAdditionalRentalServiceChargesDetails: 'Saved details' }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        additionalRentalServiceChargesVary: 'Yes',
        [detailsField]: 'Typed this session',
      });
    });

    it('falls back to the saved case', () => {
      const req = makeReq(
        {},
        { additionalRentalServiceChargesVary: 'Yes', varyingAdditionalRentalServiceChargesDetails: 'Saved details' }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        additionalRentalServiceChargesVary: 'Yes',
        [detailsField]: 'Saved details',
      });
    });

    it('does not return the saved details once the answer has been changed to no', () => {
      const req = makeReq(
        { [stepName]: { additionalRentalServiceChargesVary: 'No' } },
        { additionalRentalServiceChargesVary: 'Yes', varyingAdditionalRentalServiceChargesDetails: 'Saved details' }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({ additionalRentalServiceChargesVary: 'No' });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(capturedConfig.getInitialFormData(makeReq())).toEqual({});
    });
  });
});
