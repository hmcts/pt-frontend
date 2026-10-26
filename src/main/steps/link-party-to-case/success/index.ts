import { flowConfig } from '../flow.config';

import { createFormStep } from '@modules/steps';
import { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'linkPartyToCase';
const stepName = 'success';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/success.njk`,
  showCancelButton: false,
  fields: [],
});
