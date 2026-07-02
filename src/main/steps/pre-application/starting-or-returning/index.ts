import type { Request, Response } from 'express';

import { getFlowConfigForJourney } from '../../index';
import { PRE_APPLICATION_ROUTE, flowConfig } from '../flow.config';

import { createGetController, createStepNavigation } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'preApplication';
const stepName = 'starting-or-returning';
const stepNavigation = createStepNavigation(req => getFlowConfigForJourney(journeyName, req) || flowConfig);

export const step: StepDefinition = {
  url: `${PRE_APPLICATION_ROUTE}/starting-or-returning`,
  name: stepName,
  view: 'pre-application/starting-or-returning/startingOrReturning.njk',
  stepDir: __dirname,
  getController: () => {
    return createGetController(
      'pre-application/starting-or-returning/startingOrReturning.njk',
      stepName,
      stepNavigation,
      (_req: Request) => {
        return {
          backUrl: '',
        };
      }
    );
  },
  postController: {
    post: async (req: Request, res: Response) => {
      const redirectPath = await stepNavigation.getNextStepUrl(req, stepName);

      if (!redirectPath) {
        return res.status(404).render('not-found');
      }

      res.redirect(303, redirectPath);
    },
  },
};
