import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'landlord-response';
const stepName = 'served-notice-proposing-new-rent';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/servedNoticeProposingNewRent.njk`,
  showCancelButton: false,
  isAnswered: req => Boolean(req.session.ccdCase?.landlordResponse?.servedNoticeProposingNewRent),
  fields: [
    {
      name: 'servedNoticeProposingNewRent',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      errorMessage: 'errors.servedNoticeProposingNewRent.required',
      options: [
        { value: 'Yes', translationKey: 'common:yes' },
        { value: 'No', translationKey: 'common:no' },
      ],
    },
  ],
});
