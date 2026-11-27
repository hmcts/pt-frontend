import type { Request } from 'express';
import type { Environment } from 'nunjucks';

import { step } from '../../../../main/steps/application/landlord-details/landlord-individual-or-organisation';

import { createFormStep } from '@modules/steps';

jest.mock('@modules/steps', () => {
  const actual = jest.requireActual('@modules/steps');
  return { ...actual, createFormStep: jest.fn(actual.createFormStep) };
});

jest.mock('@services/ccd/ccdApiClient', () => ({
  getCaseApi: jest.fn(() => ({ updateCase: jest.fn().mockResolvedValue({}) })),
}));

jest.mock('../../../../main/modules/steps/i18n', () => ({
  loadStepNamespace: jest.fn(),
  getStepTranslations: jest.fn(() => ({})),
  getTranslationFunction: jest.fn(() => (key: string) => key),
}));

jest.mock('../../../../main/modules/i18n', () => ({
  getRequestLanguage: jest.fn(() => 'en'),
  getCommonTranslations: jest.fn(() => ({})),
}));

const CASE_REF = '1234123412341234';
const firstNameField = 'landlordIndividualOrOrganisation.landlordFirstName';
const lastNameField = 'landlordIndividualOrOrganisation.landlordLastName';
const organisationNameField = 'landlordIndividualOrOrganisation.landlordOrganisationName';

describe('application landlord-individual-or-organisation step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];
  const nunjucksEnv = { render: jest.fn(() => '') } as unknown as Environment;
  const stepName = 'landlord-individual-or-organisation';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const post = async (body: Record<string, unknown>): Promise<{ req: any; res: any; next: jest.Mock }> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = { redirect: jest.fn(), render: jest.fn(), send: jest.fn(), locals: {} } as any;
    res.status = jest.fn(() => res);

    const req = {
      body,
      originalUrl: `/${CASE_REF}/${stepName}`,
      query: { lang: 'en' },
      params: { caseReference: CASE_REF },
      session: {
        formData: { [CASE_REF]: {} },
      },
      app: { locals: { nunjucksEnv } },
      i18n: { getResourceBundle: jest.fn(() => ({})) },
      res,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    const next = jest.fn();

    if (!step.postController) {
      throw new Error('expected postController');
    }
    await step.postController.post(req, res, next);
    return { req, res, next };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('clears organisation name when individual is selected', async () => {
    const { req, res } = await post({
      action: 'continue',
      landlordIndividualOrOrganisation: 'individual',
      [firstNameField]: 'John',
      [lastNameField]: 'Smith',
      [organisationNameField]: 'Organisation Ltd',
    });

    expect(res.redirect).toHaveBeenCalled();
    expect(req.session.formData[CASE_REF][stepName]).toStrictEqual({
      landlordIndividualOrOrganisation: 'individual',
      [firstNameField]: 'John',
      [lastNameField]: 'Smith',
    });
  });

  it('clears individual names when organisation is selected', async () => {
    const { req, res } = await post({
      action: 'continue',
      landlordIndividualOrOrganisation: 'organisation',
      [firstNameField]: 'John',
      [lastNameField]: 'Smith',
      [organisationNameField]: 'Organisation Ltd',
    });

    expect(res.redirect).toHaveBeenCalled();
    expect(req.session.formData[CASE_REF][stepName]).toStrictEqual({
      landlordIndividualOrOrganisation: 'organisation',
      [organisationNameField]: 'Organisation Ltd',
    });
  });

  describe('isAnswered', () => {
    const makeReq = (landlord?: Record<string, unknown>): Request =>
      ({ session: { ccdCase: { landlordDetails: { landlord } } } }) as unknown as Request;

    it('is not answered when nothing has been saved', () => {
      expect(step.isAnswered?.({ session: {} } as unknown as Request)).toBe(false);
      expect(step.isAnswered?.(makeReq())).toBe(false);
    });

    it('is answered when an individual first and last name are saved', () => {
      expect(step.isAnswered?.(makeReq({ firstName: 'John', lastName: 'Smith' }))).toBe(true);
    });

    it('is not answered when only the first name is saved', () => {
      expect(step.isAnswered?.(makeReq({ firstName: 'John' }))).toBe(false);
    });

    it('is answered when an organisation name is saved', () => {
      expect(step.isAnswered?.(makeReq({ organisationName: 'Organisation Ltd' }))).toBe(true);
    });
  });

  describe('getInitialFormData', () => {
    const makeReq = (savedLandlord?: Record<string, unknown>, formData?: Record<string, unknown>) => ({
      params: { caseReference: CASE_REF },
      session: {
        formData: formData ? { [CASE_REF]: { [stepName]: formData } } : {},
        ccdCase: { landlordDetails: { landlord: savedLandlord } },
      },
    });

    it('pre-populates an individual landlord from the case', () => {
      expect(capturedConfig.getInitialFormData(makeReq({ firstName: 'John', lastName: 'Smith' }))).toEqual({
        landlordIndividualOrOrganisation: 'individual',
        [firstNameField]: 'John',
        [lastNameField]: 'Smith',
      });
    });

    it('pre-populates an organisation landlord from the case', () => {
      expect(capturedConfig.getInitialFormData(makeReq({ organisationName: 'Organisation Ltd' }))).toEqual({
        landlordIndividualOrOrganisation: 'organisation',
        [organisationNameField]: 'Organisation Ltd',
      });
    });

    it('prefers saved form data over case values', () => {
      const req = makeReq(
        { firstName: 'John', lastName: 'Smith' },
        { landlordIndividualOrOrganisation: 'organisation', [organisationNameField]: 'Amended Ltd' }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        landlordIndividualOrOrganisation: 'organisation',
        [organisationNameField]: 'Amended Ltd',
      });
    });

    it('returns an empty object when nothing is saved', () => {
      expect(capturedConfig.getInitialFormData(makeReq())).toEqual({});
    });
  });
});
