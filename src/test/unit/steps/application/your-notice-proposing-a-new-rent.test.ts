import type { Environment } from 'nunjucks';

import { step } from '../../../../main/steps/application/application-documents/landlords-notice/your-notice-proposing-a-new-rent';

jest.mock('../../../../main/modules/steps/i18n', () => ({
  loadStepNamespace: jest.fn(),
  getStepTranslations: jest.fn(() => ({})),
  getTranslationFunction: jest.fn(() => (key: string) => key),
}));

jest.mock('../../../../main/modules/i18n', () => ({
  getRequestLanguage: jest.fn(() => 'en'),
  getCommonTranslations: jest.fn(() => ({})),
}));

describe('application your-notice-proposing-a-new-rent step', () => {
  const nunjucksEnv = { render: jest.fn(() => '') } as unknown as Environment;
  const stepName = 'your-notice-proposing-a-new-rent';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const post = async (body: Record<string, unknown>): Promise<{ req: any; res: any; next: jest.Mock }> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = { redirect: jest.fn(), render: jest.fn(), send: jest.fn(), locals: {} } as any;
    res.status = jest.fn(() => res);

    const req = {
      body,
      originalUrl: `/1234123412341234/${stepName}`,
      query: { lang: 'en' },
      session: {
        formData: {},
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

  it('clears noticeNotLegallyValidReason when yes is selected', async () => {
    const { req, res } = await post({
      action: 'continue',
      noticeLegallyValid: 'yes',
      noticeNotLegallyValidReason: 'some reason',
    });

    expect(res.redirect).toHaveBeenCalled();
    expect(req.session.formData[stepName]).toStrictEqual({
      noticeLegallyValid: 'yes',
    });
  });
});
