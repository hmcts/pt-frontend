import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/landlord-response/your-response/respond-to-tenants-application/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';
const STEP_NAME = 'respond-to-tenants-application';

describe('lanlord-response respond-to-tenants-application step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (stepData: Record<string, unknown> = {}, ccdCase?: Record<string, unknown>): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: { [STEP_NAME]: stepData } }, ccdCase },
    }) as unknown as Request;

  describe('extendGetContent', () => {
    it('build the view-tenants-application URL for the current case', () => {
      expect(capturedConfig.extendGetContent(makeReq())).toEqual({
        viewTenantsApplicationUrl: `/${CASE_REF}/landlord-response/view-tenants-application`,
      });
    });
  });
});
