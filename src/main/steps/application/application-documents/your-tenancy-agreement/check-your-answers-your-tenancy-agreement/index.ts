import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'application';
const stepName = 'check-your-answers-your-tenancy-agreement';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/checkYourAnswersYourTenancyAgreement.njk`,
  showCancelButton: false,
  isAnswered: () => false,
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
    pageCaption: 'pageCaption',
  },
  fields: [],
});
