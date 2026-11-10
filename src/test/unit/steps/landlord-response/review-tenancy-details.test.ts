import type { Request } from 'express';

import { isAnswered } from '../../../../main/steps/landlord-response/your-response/review-tenancy-details/index';

import { createFormStep } from '@modules/steps';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
  getTranslationFunction: jest.fn(() => (key: string) => key),
}));

const CASE_REF = '1234123412341234';
const STEP_NAME = 'review-tenancy-details';
const FIELD = 'respondToTenantAnswersAboutTenancyDetails';
const DETAILS = 'respondToTenantAnswersAboutTenancyDetailsDescription';

describe('landlord-response review-tenancy-details step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (stepData: Record<string, unknown> = {}): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: { [STEP_NAME]: stepData } } },
    }) as unknown as Request;

  const detailsValidator = capturedConfig.fields[0].options[0].subFields[DETAILS].validator;

  it('accepts details of 500 characters and rejects 501', () => {
    expect(detailsValidator('a'.repeat(500))).toBe(true);
    expect(detailsValidator('a'.repeat(501))).toBe(`errors.${DETAILS}.invalid`);
  });

  describe('beforeRedirect', () => {
    it('clears the details when the landlord does not want to respond', () => {
      const stepData = { [FIELD]: 'No', [`${FIELD}.${DETAILS}`]: 'old text' };
      capturedConfig.beforeRedirect(makeReq(stepData));
      expect(stepData[`${FIELD}.${DETAILS}`]).toBe('');
    });

    it('keeps the details when the landlord wants to respond', () => {
      const stepData = { [FIELD]: 'Yes', [`${FIELD}.${DETAILS}`]: 'my reasons' };
      capturedConfig.beforeRedirect(makeReq(stepData));
      expect(stepData[`${FIELD}.${DETAILS}`]).toBe('my reasons');
    });
  });

  describe('isAnswered', () => {
    it.each([
      ['no case', undefined, false],
      ['no response yet', {}, false],
      ['No', { landlordResponse: { [FIELD]: 'No' } }, true],
      ['Yes with details', { landlordResponse: { [FIELD]: 'Yes', [DETAILS]: 'my reasons' } }, true],
      ['Yes with details missing', { landlordResponse: { [FIELD]: 'Yes', [DETAILS]: null } }, false],
    ])('returns the right answer for %s', (_label, ccdCase, expected) => {
      expect(isAnswered(ccdCase as never)).toBe(expected);
    });
  });

  it('reads the answer from the case loaded into the session', () => {
    const req = makeReq();
    (req.session as unknown as Record<string, unknown>).ccdCase = { landlordResponse: { [FIELD]: 'No' } };
    expect(capturedConfig.isAnswered(req)).toBe(true);
  });

  describe('getInitialFormData', () => {
    const withCase = (stepData: Record<string, unknown>, landlordResponse?: Record<string, unknown>): Request => {
      const req = makeReq(stepData);
      (req.session as unknown as Record<string, unknown>).ccdCase = { landlordResponse };
      return req;
    };

    it('uses what the landlord has entered this session', () => {
      const req = withCase({ [FIELD]: 'Yes', [`${FIELD}.${DETAILS}`]: 'typed now' }, { [FIELD]: 'No' });
      expect(capturedConfig.getInitialFormData(req)).toEqual({ [FIELD]: 'Yes', [`${FIELD}.${DETAILS}`]: 'typed now' });
    });

    it('falls back to the saved answer and details', () => {
      const req = withCase({}, { [FIELD]: 'Yes', [DETAILS]: 'saved reasons' });
      expect(capturedConfig.getInitialFormData(req)).toEqual({
        [FIELD]: 'Yes',
        [`${FIELD}.${DETAILS}`]: 'saved reasons',
      });
    });

    it('does not bring back saved details once the answer is No', () => {
      const req = withCase({ [FIELD]: 'No' }, { [FIELD]: 'Yes', [DETAILS]: 'saved reasons' });
      expect(capturedConfig.getInitialFormData(req)).toEqual({ [FIELD]: 'No' });
    });

    it('is empty when nothing has been answered', () => {
      expect(capturedConfig.getInitialFormData(withCase({}))).toEqual({});
    });
  });

  it('links to the tenant application and builds the tenancy rows', () => {
    expect(capturedConfig.extendGetContent(makeReq())).toEqual({
      viewTenantsApplicationUrl: `/${CASE_REF}/landlord-response/view-tenants-application`,
      tenancyDetailsRows: [],
    });
  });
});
