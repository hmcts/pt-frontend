import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/landlord-response/your-response/property-address/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';
const STEP_NAME = 'respond-to-tenants-application';

describe('landlord-response respond-to-tenants-application step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (stepData: Record<string, unknown> = {}, ccdCase?: Record<string, unknown>): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: { [STEP_NAME]: stepData } }, ccdCase },
    }) as unknown as Request;

  describe('extendGetContent', () => {
    it('shows property address, skipping blank lines', () => {
      expect(
        capturedConfig.extendGetContent(
          makeReq(
            {},
            {
              propertyDetails: {
                addressLine1: '1 Main Street',
                addressLine2: '',
                postTown: 'London',
                postcode: 'SW1A 1AA',
              },
            }
          )
        )
      ).toEqual({
        tenantPropertyHtml: '1 Main Street<br>London<br>SW1A 1AA',
      });
    });
  });
});
