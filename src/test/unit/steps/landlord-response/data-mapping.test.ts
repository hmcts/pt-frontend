import { Request } from 'express';

import { prepareLandlordResponseDataForSave } from '../../../../main/steps/landlord-response/dataMapping';

import { PTCaseData } from '@services/ccd/ccdCase.interface';

const CASE_REF = '1234123412341234';

const buildReq = (caseReference = CASE_REF): Request =>
  ({ params: { caseReference }, session: {} }) as unknown as Request;

describe('prepareLandlordResponseDataForSave', () => {
  it('maps the case reference for the placeholder section when the saved case matches the route', () => {
    const ccdCase = { caseReference: CASE_REF } as unknown as PTCaseData;

    expect(prepareLandlordResponseDataForSave('placeholder', buildReq(), ccdCase)).toEqual({
      caseReference: CASE_REF,
    });
  });

  it('does not use saved data from a different case', () => {
    const ccdCase = { caseReference: '9999888877776666' } as unknown as PTCaseData;

    expect(prepareLandlordResponseDataForSave('placeholder', buildReq(), ccdCase)).toEqual({
      caseReference: undefined,
    });
  });

  it('returns an empty object for an unknown section', () => {
    expect(prepareLandlordResponseDataForSave('unknownSection', buildReq(), undefined)).toEqual({});
  });
});
