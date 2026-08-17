import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'application';
const stepName = 'current-tenancy-start-date';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/currentTenancyStartDate.njk`,
  showCancelButton: false,
  isAnswered: () => false,
  translationKeys: {
    heading: 'heading',
  },
  fields: [],
});
