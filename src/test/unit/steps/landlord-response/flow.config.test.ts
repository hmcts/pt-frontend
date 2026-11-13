import type { Request } from 'express';

import { flowConfig } from '../../../../main/steps/landlord-response/flow.config';

const CASE_REF = '1234123412341234';

const makeReq = (applicationType?: string, answers: Record<string, Record<string, unknown>> = {}): Request =>
  ({
    params: { caseReference: CASE_REF },
    session: {
      ccdCase: applicationType === undefined ? undefined : { applicationType },
      formData: { [CASE_REF]: answers },
    },
  }) as unknown as Request;

const isShown = (stepName: string, req: Request) => flowConfig.steps[stepName].showCondition?.(req);

describe('landlord response flow config show conditions', () => {
  it('shows the served notice page for a section 13 application', () => {
    expect(isShown('served-notice-proposing-new-rent', makeReq('challengeRentIncrease'))).toBe(true);
  });

  it.each([['challengeExcessiveRent'], [undefined]])(
    'hides the served notice page when the application type is %s',
    type => {
      expect(isShown('served-notice-proposing-new-rent', makeReq(type))).toBe(false);
    }
  );

  it('shows the tenancy details upload page only when the landlord wants to respond', () => {
    const answer = (value?: string) =>
      makeReq(undefined, { 'review-tenancy-details': { respondToTenantAnswersAboutTenancyDetails: value } });

    expect(isShown('upload-evidence-tenancy-details', answer('Yes'))).toBe(true);
    expect(isShown('upload-evidence-tenancy-details', answer('No'))).toBe(false);
    expect(isShown('upload-evidence-tenancy-details', answer())).toBe(false);
  });
});
