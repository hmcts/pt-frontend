import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import '../../../../main/steps/application/the-rent/the-current-rent-and-other-costs/rent-includes-council-tax';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';

describe('application rent-includes-council-tax step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (formData: Record<string, unknown> = {}, rentDetails?: Record<string, unknown>): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: formData }, ccdCase: { rentDetails } },
    }) as unknown as Request;

  describe('isAnswered', () => {
    it('is not answered when nothing has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
    });

    it.each(['Yes', 'No'])('is answered when %s has been saved', answer => {
      expect(capturedConfig.isAnswered(makeReq({}, { rentIncludesCouncilTax: answer }))).toBe(true);
    });
  });

  describe('beforeRedirect', () => {
    const otherAnswers = {
      'council-tax-frequency': { councilTaxFrequency: 'monthly' },
      'rent-payment-frequency': { rentPaymentFrequency: 'weekly' },
    };

    it('clears the council tax frequency page when rent does not include council tax', () => {
      const req = makeReq({ 'rent-includes-council-tax': { rentIncludesCouncilTax: 'No' }, ...otherAnswers });

      capturedConfig.beforeRedirect(req);

      expect(req.session.formData?.[CASE_REF]).toEqual({
        'rent-includes-council-tax': { rentIncludesCouncilTax: 'No' },
        'rent-payment-frequency': { rentPaymentFrequency: 'weekly' },
      });
    });

    it('keeps the council tax frequency page when rent includes council tax', () => {
      const req = makeReq({ 'rent-includes-council-tax': { rentIncludesCouncilTax: 'Yes' }, ...otherAnswers });

      capturedConfig.beforeRedirect(req);

      expect(req.session.formData?.[CASE_REF]).toEqual({
        'rent-includes-council-tax': { rentIncludesCouncilTax: 'Yes' },
        ...otherAnswers,
      });
    });
  });

  describe('getInitialFormData', () => {
    it('prefers the answer from the form data over the saved case', () => {
      const req = makeReq(
        { 'rent-includes-council-tax': { rentIncludesCouncilTax: 'No' } },
        { rentIncludesCouncilTax: 'Yes' }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({ rentIncludesCouncilTax: 'No' });
    });

    it('falls back to the saved case', () => {
      const req = makeReq({}, { rentIncludesCouncilTax: 'Yes' });

      expect(capturedConfig.getInitialFormData(req)).toEqual({ rentIncludesCouncilTax: 'Yes' });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(capturedConfig.getInitialFormData(makeReq())).toEqual({});
    });
  });
});
