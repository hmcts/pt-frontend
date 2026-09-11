import type { Environment } from 'nunjucks';

import { step } from '../../../../main/steps/application/review-submit-and-pay/tell-us-if-you-need-help/have-you-applied-for-help';

jest.mock('../../../../main/modules/steps/i18n', () => ({
  loadStepNamespace: jest.fn(),
  getStepTranslations: jest.fn(() => ({})),
  getTranslationFunction: jest.fn(() => (key: string) => key),
}));

jest.mock('../../../../main/modules/i18n', () => ({
  getRequestLanguage: jest.fn(() => 'en'),
  getCommonTranslations: jest.fn(() => ({})),
}));

describe('application have-you-applied-for-help step', () => {
  const nunjucksEnv = { render: jest.fn(() => '') } as unknown as Environment;
  const referenceNumberField = 'appliedForHelpWithFees.referenceNumber';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const post = async (body: Record<string, unknown>): Promise<{ req: any; res: any }> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = { redirect: jest.fn(), render: jest.fn(), send: jest.fn(), locals: {} } as any;
    res.status = jest.fn(() => res);

    const req = {
      body,
      originalUrl: '/1234123412341234/have-you-applied-for-help',
      query: { lang: 'en' },
      params: { caseReference: '1234123412341234' },
      session: { formData: {} },
      app: { locals: { nunjucksEnv } },
      i18n: { getResourceBundle: jest.fn(() => ({})) },
      res,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    if (!step.postController) {
      throw new Error('expected postController');
    }
    await step.postController.post(req, res, jest.fn());
    return { req, res };
  };

  it('saves the reference number when Yes is selected', async () => {
    const { req } = await post({
      action: 'continue',
      appliedForHelpWithFees: 'Yes',
      [referenceNumberField]: 'HWF-A1B-23C',
    });

    expect(req.session.formData['have-you-applied-for-help']).toStrictEqual({
      appliedForHelpWithFees: 'Yes',
      [referenceNumberField]: 'HWF-A1B-23C',
    });
  });

  it('clears the reference number when No is selected', async () => {
    const { req } = await post({
      action: 'continue',
      appliedForHelpWithFees: 'No',
      [referenceNumberField]: 'HWF-A1B-23C',
    });

    expect(req.session.formData['have-you-applied-for-help']).toStrictEqual({
      appliedForHelpWithFees: 'No',
    });
  });
});
