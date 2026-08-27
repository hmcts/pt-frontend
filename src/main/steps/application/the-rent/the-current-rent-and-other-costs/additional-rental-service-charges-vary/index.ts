import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'application';
const stepName = 'additional-rental-service-charges-vary';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/additionalRentalServiceChargesVary.njk`,
  showCancelButton: false,
  isAnswered: () => false,
  translationKeys: {
    heading: 'heading',
  },
  fields: [],
});
