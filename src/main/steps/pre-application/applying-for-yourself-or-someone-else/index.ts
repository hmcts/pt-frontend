import type { NextFunction, Request, Response } from 'express';
import { TFunction } from 'i18next';

import { getFlowConfigForJourney } from '../../index';
import { PRE_APPLICATION_ROUTE, flowConfig } from '../flow.config';

import { createGetController, createStepNavigation, loadStepNamespace, setFormData } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'preApplication';
const stepName = 'applying-for-yourself-or-someone-else';
const templatePath = 'pre-application/applying-for-yourself-or-someone-else/applyingForYourselfOrSomeoneElse.njk';
const stepNavigation = createStepNavigation(() => getFlowConfigForJourney(journeyName) || flowConfig);

export const step: StepDefinition = {
  url: `${PRE_APPLICATION_ROUTE}/applying-for-yourself-or-someone-else`,
  name: stepName,
  view: templatePath,
  stepDir: __dirname,
  getController: () => {
    return createGetController(templatePath, stepName, stepNavigation);
  },
  postController: {
    post: async (req: Request, res: Response, next: NextFunction) => {
      const applyingForYourselfOrSomeoneElse = req.body.applyingForYourselfOrSomeoneElse as string | undefined;

      if (!applyingForYourselfOrSomeoneElse) {
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
        const errorMessage = t('errors.applyingForYourselfOrSomeoneElse.required');

        return res.render(templatePath, {
          ...pageContent,
          errorSummary: [{ text: errorMessage, href: '#applyingForYourselfOrSomeoneElse' }],
          errors: {
            applyingForYourselfOrSomeoneElse: {
              msg: errorMessage,
            },
          },
        });
      }

      setFormData(req, stepName, {
        applyingForYourselfOrSomeoneElse,
      });

      const redirectPath = await stepNavigation.getNextStepUrl(req, stepName);

      if (!redirectPath) {
        return res.status(404).render('not-found');
      }

      console.log(req.session);

      res.redirect(303, redirectPath);
    },
  },
};
