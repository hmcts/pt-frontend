import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import '../../../../main/steps/application/the-rent/the-current-rent-and-other-costs/rent-inclusive-of-utility-charges';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';

describe('application rent-inclusive-of-utility-charges step', () => {
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
      expect(capturedConfig.isAnswered(makeReq({}, { rentInclusiveOfUtilityCharges: answer }))).toBe(true);
    });
  });

  describe('beforeRedirect', () => {
    const otherAnswers = {
      'utilities-paid-frequency': { utilitiesPaidFrequency: 'monthly' },
      'rent-payment-frequency': { rentPaymentFrequency: 'weekly' },
    };

    it('clears the utilities frequency page when rent does not include utilities', () => {
      const req = makeReq({
        'rent-inclusive-of-utility-charges': { rentInclusiveOfUtilityCharges: 'No' },
        ...otherAnswers,
      });

      capturedConfig.beforeRedirect(req);

      expect(req.session.formData?.[CASE_REF]).toEqual({
        'rent-inclusive-of-utility-charges': { rentInclusiveOfUtilityCharges: 'No' },
        'rent-payment-frequency': { rentPaymentFrequency: 'weekly' },
      });
    });

    it('keeps the utilities frequency page when rent includes utilities', () => {
      const req = makeReq({
        'rent-inclusive-of-utility-charges': { rentInclusiveOfUtilityCharges: 'Yes' },
        ...otherAnswers,
      });

      capturedConfig.beforeRedirect(req);

      expect(req.session.formData?.[CASE_REF]).toEqual({
        'rent-inclusive-of-utility-charges': { rentInclusiveOfUtilityCharges: 'Yes' },
        ...otherAnswers,
      });
    });
  });

  describe('getInitialFormData', () => {
    it('prefers the answer from the form data over the saved case', () => {
      const req = makeReq(
        { 'rent-inclusive-of-utility-charges': { rentInclusiveOfUtilityCharges: 'No' } },
        { rentInclusiveOfUtilityCharges: 'Yes' }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({ rentInclusiveOfUtilityCharges: 'No' });
    });

    it('falls back to the saved case', () => {
      const req = makeReq({}, { rentInclusiveOfUtilityCharges: 'Yes' });

      expect(capturedConfig.getInitialFormData(req)).toEqual({ rentInclusiveOfUtilityCharges: 'Yes' });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(capturedConfig.getInitialFormData(makeReq())).toEqual({});
    });
  });
});
