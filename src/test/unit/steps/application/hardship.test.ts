import type { Request } from 'express';
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

  describe('hardship details validator', () => {
    const detailsField = 'rentIncreaseCauseHardship.rentIncreaseHardshipDetails';

    it('accepts details up to the maximum length', async () => {
      const { res } = await post({
        action: 'continue',
        rentIncreaseCauseHardship: 'yes',
        [detailsField]: 'a'.repeat(500),
      });

      expect(res.render).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalled();
    });

    it('returns the invalid error key when the details are too long', async () => {
      const { res } = await post({
        action: 'continue',
        rentIncreaseCauseHardship: 'yes',
        [detailsField]: 'a'.repeat(501),
      });

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render.mock.calls[0][1].errors).toEqual({
        [detailsField]: 'errors.rentIncreaseHardshipDetails.invalid',
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

    it('is answered when the citizen said the increase would cause hardship', () => {
      expect(isAnswered({ rentIncreaseCauseHardship: 'yes' })).toBe(true);
    });

    it('is answered when the citizen said the increase would not cause hardship', () => {
      expect(isAnswered({ rentIncreaseCauseHardship: 'no' })).toBe(true);
    });
  });
});
