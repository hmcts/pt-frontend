import type { NextFunction, Request, Response } from 'express';
import { TFunction } from 'i18next';

import { SIGN_IN_URL } from '../../../urls';
import { getFlowConfigForJourney } from '../../index';
import { PRE_APPLICATION_ROUTE, flowConfig } from '../flow.config';

import { createGetController, createStepNavigation, loadStepNamespace, setFormData } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'preApplication';
const stepName = 'starting-or-returning';
const templatePath = 'pre-application/starting-or-returning/startingOrReturning.njk';
const stepNavigation = createStepNavigation(() => getFlowConfigForJourney(journeyName) || flowConfig);

export const step: StepDefinition = {
  url: `${PRE_APPLICATION_ROUTE}/starting-or-returning`,
  name: stepName,
  view: templatePath,
  stepDir: __dirname,
  getController: () => {
    return createGetController(templatePath, stepName, stepNavigation);
  },
  postController: {
    post: async (req: Request, res: Response, next: NextFunction) => {
      const startingOrReturning = req.body.startingOrReturning as string | undefined;

      if (!startingOrReturning) {
        await loadStepNamespace(req);
        const getController = typeof step.getController === 'function' ? step.getController() : step.getController;
        let pageContent: Record<string, unknown> = {};
        const captureRes = {
          render: (_view: string, content: Record<string, unknown>) => {
            pageContent = content;
          },
        } as Response;

        await getController.get(req, captureRes, next);

        const t = pageContent.t as TFunction;
        const errorMessage = t('errors.startingOrReturning.required');

        return res.render(templatePath, {
          ...pageContent,
          errorSummary: [{ text: errorMessage, href: '#startingOrReturning' }],
          errors: {
            startingOrReturning: {
              msg: errorMessage,
            },
          },
        });
      }

      if (startingOrReturning === 'returning') {
        return res.redirect(SIGN_IN_URL);
      }

      setFormData(req, stepName, {
        startingOrReturning,
      });

      const redirectPath = await stepNavigation.getNextStepUrl(req, stepName);

      if (!redirectPath) {
        return res.status(404).render('not-found');
      }

      res.redirect(303, redirectPath);
    },
  },
};
