import type { Request } from 'express';
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

const CASE_REF = '1234123412341234';

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
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: {} } },
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

    expect(req.session.formData[CASE_REF]['have-you-applied-for-help']).toStrictEqual({
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

    expect(req.session.formData[CASE_REF]['have-you-applied-for-help']).toStrictEqual({
      appliedForHelpWithFees: 'No',
    });
  });

  it('stores the reference number in upper case without surrounding spaces', async () => {
    const { req } = await post({
      action: 'continue',
      appliedForHelpWithFees: 'Yes',
      [referenceNumberField]: ' hwf-a1b-23c ',
    });

    expect(req.session.formData[CASE_REF]['have-you-applied-for-help'][referenceNumberField]).toBe('HWF-A1B-23C');
  });

  it('returns the invalid error key when the reference number is not in the HWF format', async () => {
    const { res } = await post({
      action: 'continue',
      appliedForHelpWithFees: 'Yes',
      [referenceNumberField]: 'HWF-123',
    });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.render.mock.calls[0][1].errors).toEqual({ [referenceNumberField]: 'errors.referenceNumber.invalid' });
  });

  describe('isAnswered', () => {
    const isAnswered = (ccdCase?: Record<string, unknown>): unknown =>
      step.isAnswered?.({ session: { ccdCase } } as unknown as Request);

    it('is not answered when nothing has been saved', () => {
      expect(isAnswered()).toBe(false);
      expect(isAnswered({})).toBe(false);
    });

    it('is answered when the saved answer is NO', () => {
      expect(isAnswered({ appliedForHelpWithFees: 'NO' })).toBe(true);
    });

    it('is answered when the saved answer is YES with a valid reference number', () => {
      expect(isAnswered({ appliedForHelpWithFees: 'YES', referenceNumber: 'HWF-A1B-23C' })).toBe(true);
    });

    it('is not answered when the saved answer is YES without a valid reference number', () => {
      expect(isAnswered({ appliedForHelpWithFees: 'YES' })).toBe(false);
      expect(isAnswered({ appliedForHelpWithFees: 'YES', referenceNumber: 'HWF-123' })).toBe(false);
    });
  });
});
