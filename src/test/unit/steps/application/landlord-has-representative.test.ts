import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import '../../../../main/steps/application/landlord-details/landlord-has-representative/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

describe('application landlord-has-representative step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (ccdCase?: Record<string, unknown>): Request => ({ session: { ccdCase } }) as unknown as Request;

  describe('isAnswered', () => {
    it('is not answered when nothing has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
      expect(capturedConfig.isAnswered(makeReq({ landlordDetails: {} }))).toBe(false);
    });

    it.each(['Yes', 'No', 'NotSure'])('is answered when %s has been saved', answer => {
      expect(capturedConfig.isAnswered(makeReq({ landlordDetails: { hasRepresentative: answer } }))).toBe(true);
    });
  });

  describe('getInitialFormData', () => {
    const CASE_REF = '1234123412341234';

    it('pre-populates the answer from the case', () => {
      const req = {
        params: { caseReference: CASE_REF },
        session: { formData: {}, ccdCase: { landlordDetails: { hasRepresentative: 'NotSure' } } },
      };

      expect(capturedConfig.getInitialFormData(req)).toEqual({ landlordHasRepresentative: 'NotSure' });
    });

    it('prefers saved form data over the case value', () => {
      const req = {
        params: { caseReference: CASE_REF },
        session: {
          formData: { [CASE_REF]: { 'landlord-has-representative': { landlordHasRepresentative: 'No' } } },
          ccdCase: { landlordDetails: { hasRepresentative: 'Yes' } },
        },
      };

      expect(capturedConfig.getInitialFormData(req)).toEqual({ landlordHasRepresentative: 'No' });
    });

    it('returns an empty object when nothing is saved', () => {
      const req = { params: { caseReference: CASE_REF }, session: { formData: {}, ccdCase: {} } };

      expect(capturedConfig.getInitialFormData(req)).toEqual({});
    });
  });
});
