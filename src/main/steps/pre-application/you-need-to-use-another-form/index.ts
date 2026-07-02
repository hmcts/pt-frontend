import { getFlowConfigForJourney } from '../../index';
import { PRE_APPLICATION_ROUTE, flowConfig } from '../flow.config';

import { createGetController, createStepNavigation } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'preApplication';
const stepName = 'you-need-to-use-another-form';
const templatePath = 'pre-application/you-need-to-use-another-form/youNeedToUseAnotherForm.njk';
const stepNavigation = createStepNavigation(() => getFlowConfigForJourney(journeyName) || flowConfig);

export const step: StepDefinition = {
  url: `${PRE_APPLICATION_ROUTE}/you-need-to-use-another-form`,
  name: stepName,
  view: templatePath,
  stepDir: __dirname,
  getController: () => {
    return createGetController(templatePath, stepName, stepNavigation);
  },
};
