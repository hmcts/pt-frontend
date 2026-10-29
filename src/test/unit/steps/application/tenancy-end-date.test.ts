import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import '../../../../main/steps/application/the-rent/the-current-rent-and-other-costs/tenancy-end-date';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';

describe('application tenancy-end-date step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (formData: Record<string, unknown> = {}, rentDetails?: Record<string, unknown>): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: formData }, ccdCase: { rentDetails } },
    }) as unknown as Request;

  describe('isAnswered', () => {
    it('is not answered when no end date has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
    });

    it('is answered when an end date has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq({}, { currentTenancyEndDate: '2027-01-01T00:00:00' }))).toBe(true);
    });
  });

  describe('getInitialFormData', () => {
    it('prefers the date entered this session over the saved date', () => {
      const req = makeReq(
        { 'tenancy-end-date': { currentTenancyEndDate: { day: '31', month: '12', year: '2028' } } },
        { currentTenancyEndDate: '2027-01-01T00:00:00' }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        currentTenancyEndDate: { day: '31', month: '12', year: '2028' },
      });
    });

    it('splits the saved date into day, month and year', () => {
      const req = makeReq({}, { currentTenancyEndDate: '2027-01-01T00:00:00' });

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        currentTenancyEndDate: { day: '01', month: '01', year: '2027' },
      });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(capturedConfig.getInitialFormData(makeReq())).toEqual({});
    });
  });
});
