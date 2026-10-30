import { flowConfig } from '../../flow.config';

import { createFormStep, getStepUrl } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'landlord-response';
const stepName = 'respond-to-tenants-application';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/respondToTenantsApplication.njk`,
  showCancelButton: false,
  extendGetContent: req => ({
    viewTenantsApplicationUrl: getStepUrl('view-tenants-application', flowConfig, String(req.params.caseReference)),
  }),
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
    daysNotice: 'daysNotice',
    respondingOptional: 'respondingOptional',
    noFee: 'noFee',
    answersSavedAutomatically: 'answersSavedAutomatically',
    responseSharedWithTenant: 'responseSharedWithTenant',
    subheading: 'subheading',
    wantCopy: 'wantCopy',
    viewTenantsApplication: 'viewTenantsApplication',
    showTenantsAnswers: 'showTenantsAnswers',
    confirmBasicDetails: 'confirmBasicDetails',
    bullet1: 'bullet1',
    bullet2: 'bullet2',
    bullet3: 'bullet3',
    startNow: 'startNow',
  },
  fields: [],
});
