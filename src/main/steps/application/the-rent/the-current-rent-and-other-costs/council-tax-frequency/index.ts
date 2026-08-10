import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'application';
const stepName = 'council-tax-frequency';

/**
 * Stub for HDPD-593: how often is council tax paid? (optional)
 * Heading only, so HDPD-592's 'Yes' answer has a destination.
 * HDPD-593 will add the frequency radio and its revealed amount inputs.
 */

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/councilTaxFrequency.njk`,
  showCancelButton: false,
  isAnswered: () => false,
  translationKeys: {
    heading: 'heading',
  },
  fields: [],
});
