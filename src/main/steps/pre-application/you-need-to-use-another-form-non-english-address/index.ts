import { flowConfig } from '../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'preApplication';
const stepName = 'you-need-to-use-another-form-non-english-address';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/youNeedToUseAnotherFormNonEnglishAddress.njk`,
  showCancelButton: false,
  translationKeys: {
    pageTitle: 'questionTitle',
  },
  fields: [],
});
