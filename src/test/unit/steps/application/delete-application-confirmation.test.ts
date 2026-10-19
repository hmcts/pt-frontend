import type { Environment } from 'nunjucks';

import { step } from '../../../../main/steps/application/delete-application/delete-application-confirmation';

import { getCaseApi } from '@services/ccd/ccdApiClient';

jest.mock('../../../../main/modules/steps/i18n', () => ({
  loadStepNamespace: jest.fn(),
  getStepTranslations: jest.fn(() => ({})),
  getTranslationFunction: jest.fn(() => (key: string) => key),
}));

jest.mock('../../../../main/modules/i18n', () => ({
  getRequestLanguage: jest.fn(() => 'en'),
  getCommonTranslations: jest.fn(() => ({})),
}));

jest.mock('@services/ccd/ccdApiClient', () => ({
  getCaseApi: jest.fn(),
}));

const CASE_REF = '1234123412341234';
const OTHER_CASE_REF = '9999999999999999';

describe('application delete-application-confirmation step', () => {
  const nunjucksEnv = { render: jest.fn(() => '') } as unknown as Environment;
  const user = { accessToken: 'token' };
  const deleteCase = jest.fn();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const post = async (body: Record<string, unknown>): Promise<{ req: any; res: any; next: jest.Mock }> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = { render: jest.fn(), send: jest.fn(), locals: {}, headersSent: false } as any;
    res.status = jest.fn(() => res);
    // Express marks the response as sent, which stops the form handler redirecting a second time.
    res.redirect = jest.fn(() => {
      res.headersSent = true;
    });

    const req = {
      body,
      originalUrl: `/${CASE_REF}/delete-application-confirmation`,
      query: { lang: 'en' },
      params: { caseReference: CASE_REF },
      session: {
        user,
        formData: { [CASE_REF]: { 'text-updates': { textUpdates: 'No' } }, [OTHER_CASE_REF]: { 'text-updates': {} } },
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
    (getCaseApi as jest.Mock).mockReturnValue({ deleteCase });
  });

  it('returns to the task list without deleting when the citizen chooses no', async () => {
    const { req, res } = await post({ action: 'continue', deleteApplicationConfirmation: 'no' });

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(303, `/${CASE_REF}/task-list`);
    expect(getCaseApi).not.toHaveBeenCalled();
    expect(req.session.formData[CASE_REF]).toBeDefined();
  });

  it('deletes the case as the signed in user and goes to the success page when the citizen chooses yes', async () => {
    deleteCase.mockResolvedValue({});

    const { res } = await post({ action: 'continue', deleteApplicationConfirmation: 'yes' });

    expect(getCaseApi).toHaveBeenCalledWith(user);
    expect(deleteCase).toHaveBeenCalledWith(CASE_REF);
    expect(res.redirect).toHaveBeenCalledWith(303, `/${CASE_REF}/delete-application-success`);
  });

  it('clears the deleted case answers and keeps answers for other cases', async () => {
    deleteCase.mockResolvedValue({});

    const { req } = await post({ action: 'continue', deleteApplicationConfirmation: 'yes' });

    expect(req.session.formData).toEqual({ [OTHER_CASE_REF]: { 'text-updates': {} } });
  });

  it('passes the error on and keeps the answers when the delete fails', async () => {
    const error = new Error('CCD unavailable');
    deleteCase.mockRejectedValue(error);

    const { req, res, next } = await post({ action: 'continue', deleteApplicationConfirmation: 'yes' });

    expect(next).toHaveBeenCalledWith(error);
    expect(res.redirect).not.toHaveBeenCalled();
    expect(req.session.formData[CASE_REF]).toBeDefined();
  });
});
