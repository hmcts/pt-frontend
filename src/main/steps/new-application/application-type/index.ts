import { flowConfig } from '../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'newApplication';
const stepName = 'application-type';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/applicationType.njk`,
  showCancelButton: false,
  translationKeys: {
    pageTitle: 'questionTitle',
  },
  fields: [],
});
