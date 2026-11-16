import { Request } from 'express';

import { prepareLandlordResponseDataForSave } from '../../../../main/steps/landlord-response/dataMapping';

import { PTCaseData } from '@services/ccd/ccdCase.interface';

const CASE_REF = '1234123412341234';
const SECTION_ID = 'yourResponse';

const buildReq = (stepData?: Record<string, unknown>, caseReference = CASE_REF): Request =>
  ({
    params: { caseReference },
    session: { formData: stepData ? { [caseReference]: { 'your-phone-number': stepData } } : {} },
  }) as unknown as Request;

const savedCase = (landlordPhoneNumber?: string, caseReference = CASE_REF): PTCaseData =>
  ({ caseReference, landlordResponse: { landlordPhoneNumber } }) as unknown as PTCaseData;

const expected = (landlordPhoneNumber?: string): Record<string, unknown> => ({
  landlordResponse: { landlordPhoneNumber },
});

describe('prepareLandlordResponseDataForSave', () => {
  describe('yourResponse', () => {
    it('maps the phone number from the session form data', () => {
      expect(
        prepareLandlordResponseDataForSave(SECTION_ID, buildReq({ landlordPhoneNumber: '07123 456789' }), undefined)
      ).toEqual(expected('07123 456789'));
    });

    it('prefers the session form data over the saved case', () => {
      expect(
        prepareLandlordResponseDataForSave(
          SECTION_ID,
          buildReq({ landlordPhoneNumber: '07123 456789' }),
          savedCase('01303 715342')
        )
      ).toEqual(expected('07123 456789'));
    });

    it('falls back to the saved phone number when the saved case matches the route', () => {
      expect(prepareLandlordResponseDataForSave(SECTION_ID, buildReq(), savedCase('01303 715342'))).toEqual(
        expected('01303 715342')
      );
    });

    it('does not use saved data from a different case', () => {
      expect(
        prepareLandlordResponseDataForSave(SECTION_ID, buildReq(), savedCase('01303 715342', '9999888877776666'))
      ).toEqual(expected(undefined));
    });

    it('maps undefined when there is no form data or saved case', () => {
      expect(prepareLandlordResponseDataForSave(SECTION_ID, buildReq(), undefined)).toEqual(expected(undefined));
    });
  });

  it.each(['unknownSection', 'yourPhoneNumber'])('returns an empty object for the unmapped section %s', sectionId => {
    expect(
      prepareLandlordResponseDataForSave(sectionId, buildReq({ landlordPhoneNumber: '07123 456789' }), undefined)
    ).toEqual({});
  });
});
