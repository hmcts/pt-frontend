import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'application';
const stepName = 'rent-includes-council-tax';

const fieldName = 'rentIncludesCouncilTax';

/**
 * Stateless step: does the rent include council tax?
 * A required Yes/No radio. 'Yes' routes on to HDPD-593 via that step's
 * showCondition; 'No' skips it, so this step needs no routing of its own.
 */

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/rentIncludesCouncilTax.njk`,
  showCancelButton: false,
  // Task-list status tag: 'NO' is a complete answer, so presence is enough.
  isAnswered: req => Boolean(req.session.ccdCase?.rentIncludesCouncilTax),
  fields: [
    {
      name: fieldName,
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle' },
      errorMessage: `errors.${fieldName}.required`,
      options: [
        { value: 'YES', translationKey: 'options.YES.label' },
        { value: 'NO', translationKey: 'options.NO.label' },
      ],
    },
  ],
});
