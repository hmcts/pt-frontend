import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import { getStepUrl } from '@modules/steps/flow';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'landlord-response';
const stepName = 'transfer-case';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/transfer-case.njk`,
  showCancelButton: false,
  isAnswered: () => false,
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
    returnToCaseOverview: 'returnToCaseOverview',
  },
  extendGetContent: req => ({
    returnCaseOverviewUrl: getStepUrl('task-list', flowConfig, req.params.caseReference as string),
  }),
  fields: [],
});
