import type { Environment } from 'nunjucks';

import { step } from '../../../../main/steps/application/the-rent/the-current-rent-and-other-costs/tribunal-previously-determined-rent';

jest.mock('../../../../main/modules/steps/i18n', () => ({
  loadStepNamespace: jest.fn(),
  getStepTranslations: jest.fn(() => ({})),
  getTranslationFunction: jest.fn(() => (key: string) => key),
}));

jest.mock('../../../../main/modules/i18n', () => ({
  getRequestLanguage: jest.fn(() => 'en'),
  getCommonTranslations: jest.fn(() => ({})),
}));

describe('application tribunal-previously-determined-rent step', () => {
  const nunjucksEnv = { render: jest.fn(() => '') } as unknown as Environment;
  const caseReferenceField = 'tribunalPreviouslyDeterminedRent.previousTribunalCaseReference';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const post = async (body: Record<string, unknown>): Promise<{ req: any; res: any; next: jest.Mock }> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = { redirect: jest.fn(), render: jest.fn(), send: jest.fn(), locals: {} } as any;
    res.status = jest.fn(() => res);

    const req = {
      body,
      originalUrl: '/1234123412341234/tribunal-previously-determined-rent',
      query: { lang: 'en' },
      session: { formData: {} },
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

  it('saves the answer and continues when NO is selected', async () => {
    const { req, res } = await post({ action: 'continue', tribunalPreviouslyDeterminedRent: 'NO' });

    expect(req.session.formData['tribunal-previously-determined-rent']).toStrictEqual({
      tribunalPreviouslyDeterminedRent: 'NO',
    });
    expect(res.redirect).toHaveBeenCalled();
  });

  it('continues when YES is selected without a case reference', async () => {
    const { res } = await post({
      action: 'continue',
      tribunalPreviouslyDeterminedRent: 'YES',
      [caseReferenceField]: '',
    });

    expect(res.redirect).toHaveBeenCalled();
  });

  it('saves the case reference when YES is selected with one', async () => {
    const { req } = await post({
      action: 'continue',
      tribunalPreviouslyDeterminedRent: 'YES',
      [caseReferenceField]: 'LON/00AD/SMO/2023/0001',
    });

    expect(req.session.formData['tribunal-previously-determined-rent']).toStrictEqual({
      tribunalPreviouslyDeterminedRent: 'YES',
      [caseReferenceField]: 'LON/00AD/SMO/2023/0001',
    });
  });

  it('stores the case reference uppercased', async () => {
    const { req } = await post({
      action: 'continue',
      tribunalPreviouslyDeterminedRent: 'YES',
      [caseReferenceField]: '  lon/00ad/smo/2023/0001  ',
    });

    expect(req.session.formData['tribunal-previously-determined-rent'][caseReferenceField]).toBe(
      'LON/00AD/SMO/2023/0001'
    );
  });

  it('clears any previously entered case reference when NO is selected', async () => {
    const { req } = await post({
      action: 'continue',
      tribunalPreviouslyDeterminedRent: 'NO',
      [caseReferenceField]: 'LON/00AD/SMO/2023/0001',
    });

    expect(req.session.formData['tribunal-previously-determined-rent'][caseReferenceField]).toBeUndefined();
  });

  it('errors when no option is selected', async () => {
    const { res } = await post({ action: 'continue' });

    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('errors when the case reference is not in the tribunal format', async () => {
    const { res } = await post({
      action: 'continue',
      tribunalPreviouslyDeterminedRent: 'YES',
      [caseReferenceField]: 'LON/0000/SMO/2023/0001',
    });

    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('does not validate the case reference when NO is selected', async () => {
    const { res } = await post({
      action: 'continue',
      tribunalPreviouslyDeterminedRent: 'NO',
      [caseReferenceField]: 'not-a-valid-reference',
    });

    expect(res.redirect).toHaveBeenCalled();
  });
});
