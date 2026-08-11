import type { NextFunction, Request, Response } from 'express';
import type { TFunction } from 'i18next';

import { APPLICATION_ROUTE, flowConfig } from '../flow.config';
import { findSectionIdForStep } from '../sections.config';

import type { SummaryListRow } from './cyaRow';

import { createGetController, createStepNavigation, getTranslationFunction } from '@modules/steps';
import { getStepUrl } from '@modules/steps/flow';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { getCaseApi } from '@services/ccdApiClient';
import { prepareDataForSave } from '@services/data-mapping';
import { getFlowConfigForJourney } from '@steps';

const journeyName = 'application';

// Every section-CYA page renders through this one template.
const VIEW = 'application/section-cya/sectionCya.njk';

export interface SectionCyaStepConfig {
  /** Journey step slug, e.g. 'check-your-answers-your-response'. */
  stepName: string;
  /** Translation key for the summary-card title (and the page <title>). */
  cardTitleKey: string;
  /** The owning folder's __dirname. */
  stepDir: string;
  /** Section-specific row builder. */
  buildRows: (req: Request, t: TFunction) => SummaryListRow[];
  /** Render rows with GOV.UK classes on presentation divs, avoiding dl/dt/dd announcements. */
  renderRowsAsPresentation?: boolean;
}

/**
 * Builds the StepDefinition for a create-application section-CYA page. Every section
 * CYA shares the same controller wiring, navigation and template — only the card
 * title and the row builder differ, so those are the only inputs.
 */
export function createSectionCyaStep({
  stepName,
  cardTitleKey,
  stepDir,
  buildRows,
  renderRowsAsPresentation = false,
}: SectionCyaStepConfig): StepDefinition {
  const resolveFlow = () => getFlowConfigForJourney(journeyName) || flowConfig;
  const stepNavigation = createStepNavigation(resolveFlow);

  return {
    url: `${APPLICATION_ROUTE}/${stepName}`,
    name: stepName,
    view: VIEW,
    stepDir,
    getController: () =>
      createGetController(VIEW, stepName, stepNavigation, async (req: Request) => {
        const caseRef = req.session.ccdCase?.caseReference;
        const t: TFunction = getTranslationFunction(req);
        const cardTitle = t(cardTitleKey);
        const rows = buildRows(req, t);

        return {
          summaryData: {
            cardTitle,
            renderRowsAsPresentation,
            rows,
          },
          formAction: `/${caseRef}/${stepName}`,
          backUrl: await stepNavigation.getBackUrl(req, stepName),
        };
      }),
    postController: {
      post: async (req: Request, res: Response, next: NextFunction) => {
        const action = req.body?.action;
        const isSaveForLater = action === 'saveForLater';
        const caseRef = req.session.ccdCase?.caseReference;
        const sectionId = findSectionIdForStep(stepName);

        if (sectionId) {
          try {
            const allFormData = req.session.formData
              ? Object.values(req.session.formData).reduce((acc, stepData) => ({ ...acc, ...stepData }), {})
              : {};
            const ccdCaseApi = getCaseApi(req.session.user);
            const caseReference = String(req.session.ccdCase?.caseReference);
            const data = prepareDataForSave(sectionId, allFormData);

            await ccdCaseApi.updateCase(caseReference, data);

            delete req.session.formData;
          } catch (error) {
            return next(error);
          }
        }

        // Redirect the user if they arrived here via the end-of-journey CYA change link.
        // Clear the flag so that future edits from the task-list won't redirect back to the  end-of-journey CYA.
        if (req.session.returnToCya) {
          const returnUrl = req.session.returnToCya;
          delete req.session.returnToCya;
          if (!isSaveForLater) {
            return res.redirect(303, returnUrl);
          }
        }

        // Hub-first: both S&C and SFL land on the task-list for the citizen variant.
        // Status differs (Done vs In progress) via the completedSections write above.
        const activeFlow = resolveFlow();
        const hub = activeFlow.hubStepName;
        if (hub) {
          return res.redirect(303, getStepUrl(hub, activeFlow, String(caseRef)));
        }

        if (isSaveForLater) {
          return res.redirect(303, `/${caseRef}/task-list`);
        }
        const redirectPath = await stepNavigation.getNextStepUrl(req, stepName);
        if (!redirectPath) {
          return res.status(404).render('not-found');
        }
        res.redirect(303, redirectPath);
      },
    },
  };
}
