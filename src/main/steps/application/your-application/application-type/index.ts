import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'application';
const stepName = 'application-type';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/applicationType.njk`,
  showCancelButton: false,
  isAnswered: () => true,
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
  },
  fields: [],
  extendGetContent: req => {
    const caseData = req.session.ccdCase;
    return {
      applicationType: caseData?.applicationType,
      tenancyType: caseData?.tenancyType,
    };
  },
});
