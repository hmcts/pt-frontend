import type { Environment } from 'nunjucks';

import { step } from '../../../../main/steps/application/application-documents/landlords-notice/hardship';

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

describe('application hardship step', () => {
  const nunjucksEnv = { render: jest.fn(() => '') } as unknown as Environment;
  const stepName = 'hardship';

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

  it('clears rentIncreaseHardshipDetails when no is selected', async () => {
    const { req, res } = await post({
      action: 'continue',
      rentIncreaseCauseHardship: 'no',
      rentIncreaseHardshipDetails: 'some reason',
    });

    expect(res.redirect).toHaveBeenCalled();
    expect(req.session.formData[CASE_REF][stepName]).toStrictEqual({
      rentIncreaseCauseHardship: 'no',
    });
  });
});
