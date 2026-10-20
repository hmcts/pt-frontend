import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import '../../../../main/steps/application/the-rent/the-current-rent-and-other-costs/current-tenancy-start-date';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';

describe('application current-tenancy-start-date step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (formData: Record<string, unknown> = {}, currentRentsDetails?: Record<string, unknown>): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: formData }, ccdCase: { currentRentsDetails } },
    }) as unknown as Request;

  describe('isAnswered', () => {
    it('is not answered when no start date has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
    });

    it('is answered when a start date has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq({}, { currentTenancyStartDate: '2020-06-01T00:00:00' }))).toBe(true);
    });
  });

  describe('getInitialFormData', () => {
    it('prefers the date entered this session over the saved date', () => {
      const req = makeReq(
        { 'current-tenancy-start-date': { currentTenancyStartDate: { day: '3', month: '4', year: '2021' } } },
        { currentTenancyStartDate: '2020-06-01T00:00:00' }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        currentTenancyStartDate: { day: '3', month: '4', year: '2021' },
      });
    });

    it('splits the saved date into day, month and year', () => {
      const req = makeReq({}, { currentTenancyStartDate: '2020-06-01T00:00:00' });

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        currentTenancyStartDate: { day: '01', month: '06', year: '2020' },
      });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(capturedConfig.getInitialFormData(makeReq())).toEqual({});
    });
  });
});
