import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/the-property/repairs-and-improvements/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';
const STEP = 'repairs-and-improvements';

describe('application repairs-and-improvements step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (stepFormData: Record<string, unknown> = {}, propertyDetails?: Record<string, unknown>): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: {
        formData: { [CASE_REF]: { [STEP]: stepFormData } },
        ccdCase: propertyDetails ? { propertyDetails } : undefined,
      },
    }) as unknown as Request;

  describe('isAnswered', () => {
    it('is not answered when nothing has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
    });

    it('is answered once an option has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq({}, { anyTenantsMadePropertyRepairs: 'NotSure' }))).toBe(true);
    });
  });

  describe('getInitialFormData', () => {
    it.each(['Yes', 'No', 'NotSure'])('prefills the saved %s answer', answer => {
      expect(capturedConfig.getInitialFormData(makeReq({}, { anyTenantsMadePropertyRepairs: answer }))).toEqual({
        anyTenantsMadePropertyRepairs: answer,
      });
    });

    it('prefers the answer in the session over the saved case', () => {
      const req = makeReq({ anyTenantsMadePropertyRepairs: 'Yes' }, { anyTenantsMadePropertyRepairs: 'No' });

      expect(capturedConfig.getInitialFormData(req)).toEqual({ anyTenantsMadePropertyRepairs: 'Yes' });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(capturedConfig.getInitialFormData(makeReq())).toEqual({});
    });
  });
});
