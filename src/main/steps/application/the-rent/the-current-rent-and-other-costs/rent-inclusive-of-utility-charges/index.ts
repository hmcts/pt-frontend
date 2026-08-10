import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'application';
const stepName = 'rent-inclusive-of-utility-charges';

/**
 * Stub for HDPD-594: does the rent include any charges for utilities?
 * Heading only, so HDPD-592's 'No' answer and HDPD-593 both have a destination.
 * HDPD-594 will add the Yes/No radio and its validation.
 */

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/rentInclusiveOfUtilityCharges.njk`,
  showCancelButton: false,
  isAnswered: () => false,
  translationKeys: {
    heading: 'heading',
  },
  fields: [],
});
