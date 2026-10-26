import type { Environment } from 'nunjucks';

import { step } from '../../../../main/steps/application/landlord-details/landlord-individual-or-organisation';

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
});
