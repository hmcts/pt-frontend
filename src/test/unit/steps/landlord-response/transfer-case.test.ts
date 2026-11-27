import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/landlord-response/related-content/transfer-case/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';

describe('landlord-response transfer-case step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (): Request =>
    ({
      params: { caseReference: CASE_REF },
    }) as unknown as Request;

  describe('extendGetContent', () => {
    it('returns the case overview URL using the case reference', () => {
      expect(capturedConfig.extendGetContent(makeReq())).toEqual({
        returnCaseOverviewUrl: `/${CASE_REF}/landlord-response/task-list`,
      });
    });
  });
});
