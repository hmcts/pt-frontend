import type { Request } from 'express';
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

const CASE_REF = '1234123412341234';

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

  it('clears noticeNotLegallyValidReason when yes is selected', async () => {
    const { req, res } = await post({
      action: 'continue',
      noticeLegallyValid: 'yes',
      noticeNotLegallyValidReason: 'some reason',
    });

    expect(res.redirect).toHaveBeenCalled();
    expect(req.session.formData[CASE_REF][stepName]).toStrictEqual({
      noticeLegallyValid: 'yes',
    });
  });

  describe('reason validator', () => {
    const reasonField = 'noticeLegallyValid.noticeNotLegallyValidReason';

    it('accepts a reason up to the maximum length', async () => {
      const { res } = await post({ action: 'continue', noticeLegallyValid: 'no', [reasonField]: 'a'.repeat(500) });

      expect(res.render).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalled();
    });

    it('returns the invalid error key when the reason is too long', async () => {
      const { res } = await post({ action: 'continue', noticeLegallyValid: 'no', [reasonField]: 'a'.repeat(501) });

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render.mock.calls[0][1].errors).toEqual({
        [reasonField]: 'errors.noticeNotLegallyValidReason.invalid',
      });
    });
  });

  describe('isAnswered', () => {
    const isAnswered = (noticeOfRentIncreaseDetails?: Record<string, unknown>): unknown =>
      step.isAnswered?.({ session: { ccdCase: { noticeOfRentIncreaseDetails } } } as unknown as Request);

    it('is not answered when nothing has been saved', () => {
      expect(isAnswered()).toBe(false);
      expect(isAnswered({})).toBe(false);
    });

    it('is answered when the citizen said the notice is legally valid', () => {
      expect(isAnswered({ noticeLegallyValid: 'yes' })).toBe(true);
    });

    it('is answered when the citizen said the notice is not legally valid', () => {
      expect(isAnswered({ noticeLegallyValid: 'no' })).toBe(true);
    });
  });
});
