import type { Environment } from 'nunjucks';

import { step } from '../../../../main/steps/application/the-rent/the-current-rent-and-other-costs/rent-payment-frequency';

jest.mock('../../../../main/modules/steps/i18n', () => ({
  loadStepNamespace: jest.fn(),
  getStepTranslations: jest.fn(() => ({})),
  getTranslationFunction: jest.fn(() => (key: string) => key),
}));

jest.mock('../../../../main/modules/i18n', () => ({
  getRequestLanguage: jest.fn(() => 'en'),
  getCommonTranslations: jest.fn(() => ({})),
}));

describe('application rent-payment-frequency step', () => {
  const nunjucksEnv = { render: jest.fn(() => '') } as unknown as Environment;

  const stepName = 'rent-payment-frequency';
  const weeklyField = 'rentPaymentFrequency.rentCostWeekly';
  const fortnightlyField = 'rentPaymentFrequency.rentCostFortnightly';
  const monthlyField = 'rentPaymentFrequency.rentCostMonthly';
  const yearlyField = 'rentPaymentFrequency.rentCostYearly';

  // The conditional reveal hides inputs with CSS, so the browser submits all four
  // amount fields on every POST. Tests mirror that by always sending all four.
  const body = (overrides: Record<string, unknown>): Record<string, unknown> => ({
    action: 'continue',
    [weeklyField]: '',
    [fortnightlyField]: '',
    [monthlyField]: '',
    [yearlyField]: '',
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

  // AC05
  it('errors when no frequency is selected', async () => {
    const { res } = await post(body({}));

    expect(res.redirect).not.toHaveBeenCalled();
  });

  // AC01 + AC02
  it.each([
    ['WEEKLY', weeklyField],
    ['FORTNIGHTLY', fortnightlyField],
    ['MONTHLY', monthlyField],
    ['YEARLY', yearlyField],
  ])('saves the amount and continues when %s is selected', async (frequency, amountField) => {
    const { req, res } = await post(body({ rentPaymentFrequency: frequency, [amountField]: '850.50' }));

    expect(res.redirect).toHaveBeenCalled();
    expect(req.session.formData[stepName].rentPaymentFrequency).toBe(frequency);
    expect(req.session.formData[stepName][amountField]).toBe('850.50');
  });

  // AC04
  it('errors when a frequency is selected but the amount is empty', async () => {
    const { res } = await post(body({ rentPaymentFrequency: 'MONTHLY' }));

    expect(res.redirect).not.toHaveBeenCalled();
  });

  // AC03
  it.each(['abc', '£850', '1,200', '-850', '850.555'])('errors when the amount is %s', async amount => {
    const { res } = await post(body({ rentPaymentFrequency: 'MONTHLY', [monthlyField]: amount }));

    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('does not validate the amounts for frequencies that are not selected', async () => {
    const { res } = await post(
      body({
        rentPaymentFrequency: 'WEEKLY',
        [weeklyField]: '200',
        [monthlyField]: 'not-a-number',
      })
    );

    expect(res.redirect).toHaveBeenCalled();
  });

  it('clears the amounts for frequencies that are not selected', async () => {
    const { req } = await post(
      body({
        rentPaymentFrequency: 'WEEKLY',
        [weeklyField]: '200',
        [monthlyField]: '800',
      })
    );

    expect(req.session.formData[stepName]).toStrictEqual({
      rentPaymentFrequency: 'WEEKLY',
      [weeklyField]: '200',
      [fortnightlyField]: '',
      [monthlyField]: '',
      [yearlyField]: '',
    });
  });

  // AC06
  it('continues on save for later with nothing selected', async () => {
    const { res } = await post(body({ action: 'saveForLater' }));

    expect(res.redirect).toHaveBeenCalled();
  });
});
