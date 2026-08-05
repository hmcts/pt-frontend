import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'application';
const stepName = 'landlord-has-letting-agent-or-representative';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/landlordHasLettingAgentOrRepresentative.njk`,
  showCancelButton: false,
  translationKeys: {
    pageTitle: 'questionTitle',
  },
  isAnswered: req => Boolean(req.session.ccdCase?.landlordHasLettingAgentOrRepresentative),
  fields: [
    {
      name: 'landlordHasLettingAgentOrRepresentative',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle' },
      errorMessage: 'errors.landlordHasLettingAgentOrRepresentative.required',
      options: [
        { value: 'lettingAgentOnly', translationKey: 'options.lettingAgentOnly' },
        { value: 'representativeOnly', translationKey: 'options.representativeOnly' },
        { value: 'lettingAgentAndRepresentative', translationKey: 'options.lettingAgentAndRepresentative' },
        { value: 'noLettingAgentAndRepresentative', translationKey: 'options.noLettingAgentAndRepresentative' },
        { value: 'notSure', translationKey: 'options.notSure' },
      ],
    },
  ],
});
