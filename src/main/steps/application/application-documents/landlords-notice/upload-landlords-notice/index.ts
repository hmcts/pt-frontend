import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'application';
const stepName = 'upload-landlords-notice';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/uploadLandlordsNotice.njk`,
  showCancelButton: false,
  isAnswered: () => false,
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
  },
  fields: [],
});
