import { Request } from 'express';

import { prepareLandlordResponseDataForSave } from '../../../../main/steps/landlord-response/dataMapping';

import { PTCaseData } from '@services/ccd/ccdCase.interface';

const CASE_REF = '1234123412341234';

const buildReq = (caseReference = CASE_REF, answers: Record<string, Record<string, unknown>> = {}): Request =>
  ({ params: { caseReference }, session: { formData: { [caseReference]: answers } } }) as unknown as Request;

const TENANCY = 'respondToTenantAnswersAboutTenancyDetails';
const TENANCY_DETAILS = 'respondToTenantAnswersAboutTenancyDetailsDescription';
const PROPERTY = 'respondToTenantAnswersAboutPropertyDetails';
const PROPERTY_DETAILS = 'respondToTenantAnswersAboutPropertyDetailsDescription';

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

  describe('yourResponse', () => {
    const savedCase = (landlordResponse: Record<string, unknown>) =>
      ({ caseReference: CASE_REF, landlordResponse }) as unknown as PTCaseData;

    it('sends both answers and their details from this session', () => {
      const req = buildReq(CASE_REF, {
        'review-tenancy-details': { [TENANCY]: 'Yes', [`${TENANCY}.${TENANCY_DETAILS}`]: 'Wrong start date' },
        'review-property-details': { [PROPERTY]: 'Yes', [`${PROPERTY}.${PROPERTY_DETAILS}`]: 'Only two bedrooms' },
      });

      expect(prepareLandlordResponseDataForSave('yourResponse', req, savedCase({}))).toEqual({
        landlordResponse: {
          [TENANCY]: 'Yes',
          [TENANCY_DETAILS]: 'Wrong start date',
          [PROPERTY]: 'Yes',
          [PROPERTY_DETAILS]: 'Only two bedrooms',
        },
      });
    });

    it('falls back to the saved answers when this session has none', () => {
      const saved = savedCase({
        [TENANCY]: 'No',
        [TENANCY_DETAILS]: '',
        [PROPERTY]: 'Yes',
        [PROPERTY_DETAILS]: 'Saved',
      });

      expect(prepareLandlordResponseDataForSave('yourResponse', buildReq(), saved)).toEqual({
        landlordResponse: { [TENANCY]: 'No', [TENANCY_DETAILS]: '', [PROPERTY]: 'Yes', [PROPERTY_DETAILS]: 'Saved' },
      });
    });

    it('sends empty details for a No so the saved details are cleared', () => {
      const req = buildReq(CASE_REF, {
        'review-property-details': { [PROPERTY]: 'No', [`${PROPERTY}.${PROPERTY_DETAILS}`]: '' },
      });
      const saved = savedCase({ [PROPERTY]: 'Yes', [PROPERTY_DETAILS]: 'Old reasons' });

      const result = prepareLandlordResponseDataForSave('yourResponse', req, saved);
      expect(result.landlordResponse).toEqual(expect.objectContaining({ [PROPERTY]: 'No', [PROPERTY_DETAILS]: '' }));
    });

    it('leaves out the details while a question has not been answered', () => {
      expect(prepareLandlordResponseDataForSave('yourResponse', buildReq(), savedCase({}))).toEqual({
        landlordResponse: {
          [TENANCY]: undefined,
          [TENANCY_DETAILS]: undefined,
          [PROPERTY]: undefined,
          [PROPERTY_DETAILS]: undefined,
        },
      });
    });

    it('does not use saved answers from a different case', () => {
      const other = {
        caseReference: '9999888877776666',
        landlordResponse: { [PROPERTY]: 'Yes' },
      } as unknown as PTCaseData;

      expect(prepareLandlordResponseDataForSave('yourResponse', buildReq(), other)).toEqual({
        landlordResponse: {
          [TENANCY]: undefined,
          [TENANCY_DETAILS]: undefined,
          [PROPERTY]: undefined,
          [PROPERTY_DETAILS]: undefined,
        },
      });
    });
  });

  it('returns an empty object for an unknown section', () => {
    expect(prepareLandlordResponseDataForSave('unknownSection', buildReq(), undefined)).toEqual({});
  });
});
