import type { Environment } from 'nunjucks';

import { step } from '../../../../main/steps/application/the-rent/the-current-rent-and-other-costs/council-tax-frequency';

jest.mock('../../../../main/modules/steps/i18n', () => ({
  loadStepNamespace: jest.fn(),
  getStepTranslations: jest.fn(() => ({})),
  getTranslationFunction: jest.fn(() => (key: string) => key),
}));

jest.mock('../../../../main/modules/i18n', () => ({
  getRequestLanguage: jest.fn(() => 'en'),
  getCommonTranslations: jest.fn(() => ({})),
}));

/**
 * Covers only what this step adds on top of the form builder: beforeRedirect
 * clearing the amounts and details that do not apply. Amount format rules are
 * covered by rentAmount.test.ts.
 */
describe('application council-tax-frequency step', () => {
  const nunjucksEnv = { render: jest.fn(() => '') } as unknown as Environment;

  const stepName = 'council-tax-frequency';
  const weeklyField = 'councilTaxFrequency.councilTaxCostWeekly';
  const fortnightlyField = 'councilTaxFrequency.councilTaxCostFortnightly';
  const monthlyField = 'councilTaxFrequency.councilTaxCostMonthly';
  const yearlyField = 'councilTaxFrequency.councilTaxCostYearly';
  const detailsField = 'councilTaxFrequency.councilTaxFrequencyAndCostDetails';

  const body = (overrides: Record<string, unknown>): Record<string, unknown> => ({
    action: 'continue',
    [weeklyField]: '',
    [fortnightlyField]: '',
    [monthlyField]: '',
    [yearlyField]: '',
    [detailsField]: '',
    ...overrides,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const post = async (requestBody: Record<string, unknown>): Promise<{ req: any; res: any; next: jest.Mock }> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = { redirect: jest.fn(), render: jest.fn(), send: jest.fn(), locals: {} } as any;
    res.status = jest.fn(() => res);

    const req = {
      body: requestBody,
      originalUrl: `/1234123412341234/${stepName}`,
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

  it('clears the amounts for frequencies that are not selected', async () => {
    const { req } = await post(
      body({
        councilTaxFrequency: 'WEEKLY',
        [weeklyField]: '120',
        [monthlyField]: '500',
      })
    );

    expect(req.session.formData[stepName]).toStrictEqual({
      councilTaxFrequency: 'WEEKLY',
      [weeklyField]: '120',
      [fortnightlyField]: '',
      [monthlyField]: '',
      [yearlyField]: '',
      [detailsField]: '',
    });
  });

  it('clears the details when a frequency other than OTHER is selected', async () => {
    const { req } = await post(
      body({
        councilTaxFrequency: 'MONTHLY',
        [monthlyField]: '150',
        [detailsField]: 'Paid quarterly, around 400 each time',
      })
    );

    expect(req.session.formData[stepName][detailsField]).toBe('');
  });

  it('clears all amounts and keeps the details when OTHER is selected', async () => {
    const { req } = await post(
      body({
        councilTaxFrequency: 'OTHER',
        [weeklyField]: '120',
        [detailsField]: 'Paid quarterly, around 400 each time',
      })
    );

    expect(req.session.formData[stepName]).toStrictEqual({
      councilTaxFrequency: 'OTHER',
      [weeklyField]: '',
      [fortnightlyField]: '',
      [monthlyField]: '',
      [yearlyField]: '',
      [detailsField]: 'Paid quarterly, around 400 each time',
    });
  });

  it('clears everything when no frequency is selected', async () => {
    const { req, res } = await post(body({ [weeklyField]: '120', [detailsField]: 'some text' }));

    expect(res.redirect).toHaveBeenCalled();
    expect(req.session.formData[stepName][weeklyField]).toBe('');
    expect(req.session.formData[stepName][detailsField]).toBe('');
  });
});
