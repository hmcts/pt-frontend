import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'application';
const stepName = 'rogue-task-one';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/rogueTaskOne.njk`,
  showCancelButton: false,
  translationKeys: {
    questionTitle: 'questionTitle',
    questionHint: 'questionHint',
  },

  isAnswered: req => Boolean(req.session.ccdCase?.hasRogueTaskOne),

  fields: [
    {
      name: 'hasRogueTaskOne',
      type: 'radio',
      required: true,
      isPageHeading: true,
      labelClasses: 'govuk-label--m',
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      errorMessage: 'errors.hasRogueTaskOne.required',
      options: [
        {
          value: 'notSure',
          translationKey: 'options.notSure.label',
        },
        {
          value: 'mightBeDreaming',
          translationKey: 'options.mightBeDreaming.label',
        },
        {
          value: 'goneRogue',
          translationKey: 'options.goneRogue.label',
        },
      ],
    },
  ],
});
