import type { Request, Response } from 'express';

import { HTTPError } from '../../../../../main/HttpError';
import { flowConfig } from '../../../../../main/steps/application/flow.config';
import { createSectionCyaStep } from '../../../../../main/steps/application/section-cya/createSectionCyaStep';

import type { GetController } from '@modules/steps';
import type { JourneyFlowConfig } from '@modules/steps/stepFlow.interface';
import { getCaseApi } from '@services/ccdApiClient';
import { prepareDataForSave } from '@services/data-mapping';
import { getFlowConfigForJourney } from '@steps';

const mockT = jest.fn((key: string) => `translated ${key}`);

jest.mock('@modules/steps/i18n', () => ({
  ...jest.requireActual('@modules/steps/i18n'),
  getTranslationFunction: jest.fn(() => mockT),
}));

jest.mock('@services/ccdApiClient', () => ({ getCaseApi: jest.fn() }));
jest.mock('@services/data-mapping', () => ({ prepareDataForSave: jest.fn() }));
jest.mock('@steps', () => ({ getFlowConfigForJourney: jest.fn() }));

const CASE_REF = '1234123412341234';
const OTHER_CASE = '9999999999999999';
const STEP_NAME = 'check-your-answers-contact-preferences';
const ROWS = [{ key: { text: 'Question' }, value: { text: 'Answer' } }];
const USER = { accessToken: 'token' };
const CCD_CASE = { caseReference: CASE_REF };
const PAYLOAD = { applicantContactPreferences: { textUpdates: 'No' } };

describe('createSectionCyaStep', () => {
  const buildRows = jest.fn(() => ROWS);
  const updateCase = jest.fn();

  const makeStep = (stepName = STEP_NAME, renderRowsAsPresentation?: boolean) =>
    createSectionCyaStep({
      stepName,
      cardTitleKey: 'cardTitle',
      stepDir: __dirname,
      buildRows,
      renderRowsAsPresentation,
    });

  const makeReq = (overrides: { caseReference?: string; action?: string; returnToCya?: string } = {}) =>
    ({
      params: { caseReference: 'caseReference' in overrides ? overrides.caseReference : CASE_REF },
      body: { action: overrides.action ?? 'continue' },
      session: {
        user: USER,
        ccdCase: CCD_CASE,
        returnToCya: overrides.returnToCya,
        formData: {
          [CASE_REF]: { 'text-updates': { textUpdates: 'No' } },
          [OTHER_CASE]: { 'text-updates': { textUpdates: 'Yes' } },
        },
      },
    }) as unknown as Request;

  const makeRes = () => {
    const res = { redirect: jest.fn(), render: jest.fn(), status: jest.fn(), locals: {} };
    res.status.mockReturnValue(res);
    return res as unknown as Response;
  };

  const post = async (req: Request, stepName = STEP_NAME) => {
    const res = makeRes();
    const next = jest.fn();
    await makeStep(stepName).postController!.post(req, res, next);
    return { res, next };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getFlowConfigForJourney as jest.Mock).mockReturnValue(undefined);
    (getCaseApi as jest.Mock).mockReturnValue({ updateCase });
    (prepareDataForSave as jest.Mock).mockReturnValue(PAYLOAD);
    updateCase.mockResolvedValue(undefined);
  });

  describe('GET', () => {
    const render = async (renderRowsAsPresentation?: boolean) => {
      const req = makeReq();
      const res = makeRes();
      await (makeStep(STEP_NAME, renderRowsAsPresentation).getController as () => GetController)().get(req, res);
      return { req, renderArgs: (res.render as jest.Mock).mock.calls[0] };
    };

    it('renders the shared template with the rows the section builds', async () => {
      const { req, renderArgs } = await render(true);

      expect(buildRows).toHaveBeenCalledWith(req, mockT);
      expect(renderArgs[0]).toBe('application/section-cya/sectionCya.njk');
      expect(renderArgs[1]).toEqual(
        expect.objectContaining({
          summaryData: { cardTitle: 'translated cardTitle', renderRowsAsPresentation: true, rows: ROWS },
          formAction: `/${CASE_REF}/${STEP_NAME}`,
          backUrl: `/${CASE_REF}/contact-by-phone`,
        })
      );
    });

    it('renders rows as a normal summary list unless asked otherwise', async () => {
      const { renderArgs } = await render();

      expect(renderArgs[1].summaryData.renderRowsAsPresentation).toBe(false);
    });
  });

  describe('POST', () => {
    it.each(['continue', 'saveForLater'])(
      'saves the section and returns to the task list when the citizen chooses %s',
      async action => {
        const req = makeReq({ action });
        const { res, next } = await post(req);

        expect(getCaseApi).toHaveBeenCalledWith(USER);
        expect(prepareDataForSave).toHaveBeenCalledWith('contactPreferences', req, CCD_CASE);
        expect(updateCase).toHaveBeenCalledWith(CASE_REF, PAYLOAD);
        expect(req.session.formData).toEqual({ [OTHER_CASE]: { 'text-updates': { textUpdates: 'Yes' } } });
        expect(res.redirect).toHaveBeenCalledWith(303, `/${CASE_REF}/task-list`);
        expect(next).not.toHaveBeenCalled();
      }
    );

    it('returns to the page in session.returnToCya and clears it', async () => {
      const req = makeReq({ returnToCya: `/${CASE_REF}/check-your-answers-and-submit` });
      const { res } = await post(req);

      expect(updateCase).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(303, `/${CASE_REF}/check-your-answers-and-submit`);
      expect(req.session.returnToCya).toBeUndefined();
    });

    it('goes to the task list on save for later even when session.returnToCya is set', async () => {
      const req = makeReq({ action: 'saveForLater', returnToCya: `/${CASE_REF}/check-your-answers-and-submit` });
      const { res } = await post(req);

      expect(res.redirect).toHaveBeenCalledWith(303, `/${CASE_REF}/task-list`);
      expect(req.session.returnToCya).toBeUndefined();
    });

    it.each([undefined, '1234'])('responds 404 without saving when the route case reference is %s', async caseRef => {
      const { res, next } = await post(makeReq({ caseReference: caseRef }));

      expect(next).toHaveBeenCalledWith(expect.any(HTTPError));
      expect(next.mock.calls[0][0].status).toBe(404);
      expect(updateCase).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('passes a failed save to the error handler and keeps the answers', async () => {
      const error = new Error('CCD unavailable');
      updateCase.mockRejectedValue(error);
      const req = makeReq({ returnToCya: '/somewhere' });
      const { res, next } = await post(req);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.redirect).not.toHaveBeenCalled();
      expect(req.session.formData?.[CASE_REF]).toEqual({ 'text-updates': { textUpdates: 'No' } });
      expect(req.session.returnToCya).toBe('/somewhere');
    });

    it('skips the save for a step that belongs to no section', async () => {
      const req = makeReq();
      const { res } = await post(req, 'check-your-answers-not-in-a-section');

      expect(updateCase).not.toHaveBeenCalled();
      expect(req.session.formData?.[CASE_REF]).toBeDefined();
      expect(res.redirect).toHaveBeenCalledWith(303, `/${CASE_REF}/task-list`);
    });

    it('uses the registered journey flow in preference to the imported one', async () => {
      (getFlowConfigForJourney as jest.Mock).mockReturnValue({ ...flowConfig, hubStepName: 'another-hub' });
      const { res } = await post(makeReq());

      expect(res.redirect).toHaveBeenCalledWith(303, `/${CASE_REF}/another-hub`);
    });

    describe('when the journey flow has no hub', () => {
      const withoutHub = (flow: Partial<JourneyFlowConfig>) =>
        (getFlowConfigForJourney as jest.Mock).mockReturnValue({ ...flowConfig, hubStepName: undefined, ...flow });

      it('goes to the task list on save for later', async () => {
        withoutHub({});
        const { res } = await post(makeReq({ action: 'saveForLater' }));

        expect(res.redirect).toHaveBeenCalledWith(303, `/${CASE_REF}/task-list`);
      });

      it('goes to the next step in the journey on continue', async () => {
        withoutHub({});
        const { res } = await post(makeReq());

        expect(res.redirect).toHaveBeenCalledWith(303, `/${CASE_REF}/your-information`);
      });

      it('passes a 404 error to the error handler when there is no next step', async () => {
        withoutHub({ sections: undefined, stepOrder: [STEP_NAME] });
        const { res, next } = await post(makeReq());

        expect(next).toHaveBeenCalledWith(expect.any(HTTPError));
        expect(next.mock.calls[0][0].status).toBe(404);
        expect(res.render).not.toHaveBeenCalled();
      });
    });
  });
});
