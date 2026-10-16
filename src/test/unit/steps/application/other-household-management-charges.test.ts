import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import '../../../../main/steps/application/the-rent/the-current-rent-and-other-costs/other-household-management-charges';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';

describe('application other-household-management-charges step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (formData: Record<string, unknown> = {}, currentRentsDetails?: Record<string, unknown>): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: formData }, ccdCase: { currentRentsDetails } },
    }) as unknown as Request;

  describe('isAnswered', () => {
    it('is not answered when nothing has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
    });

    it.each(['Yes', 'No'])('is answered when %s has been saved', answer => {
      expect(capturedConfig.isAnswered(makeReq({}, { anyOtherHouseholdManagementCharges: answer }))).toBe(true);
    });
  });

  describe('beforeRedirect', () => {
    const otherAnswers = {
      'other-household-management-charges-details': { otherHouseholdManagementChargesDetails: 'Cleaning' },
      'additional-rental-service-charges-vary': { additionalRentalServiceChargesVary: 'No' },
      'rent-payment-frequency': { rentPaymentFrequency: 'weekly' },
    };

    it('clears the follow-up pages when there are no other charges', () => {
      const req = makeReq({
        'other-household-management-charges': { anyOtherHouseholdManagementCharges: 'No' },
        ...otherAnswers,
      });

      capturedConfig.beforeRedirect(req);

      expect(req.session.formData?.[CASE_REF]).toEqual({
        'other-household-management-charges': { anyOtherHouseholdManagementCharges: 'No' },
        'rent-payment-frequency': { rentPaymentFrequency: 'weekly' },
      });
    });

    it('keeps the follow-up pages when there are other charges', () => {
      const req = makeReq({
        'other-household-management-charges': { anyOtherHouseholdManagementCharges: 'Yes' },
        ...otherAnswers,
      });

      capturedConfig.beforeRedirect(req);

      expect(req.session.formData?.[CASE_REF]).toEqual({
        'other-household-management-charges': { anyOtherHouseholdManagementCharges: 'Yes' },
        ...otherAnswers,
      });
    });
  });

  describe('getInitialFormData', () => {
    it('prefers the answer from the form data over the saved case', () => {
      const req = makeReq(
        { 'other-household-management-charges': { anyOtherHouseholdManagementCharges: 'No' } },
        { anyOtherHouseholdManagementCharges: 'Yes' }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({ anyOtherHouseholdManagementCharges: 'No' });
    });

    it('falls back to the saved case', () => {
      const req = makeReq({}, { anyOtherHouseholdManagementCharges: 'Yes' });

      expect(capturedConfig.getInitialFormData(req)).toEqual({ anyOtherHouseholdManagementCharges: 'Yes' });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(capturedConfig.getInitialFormData(makeReq())).toEqual({});
    });
  });
});
