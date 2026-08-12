import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'application';
const stepName = 'rogue-task-two';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/rogueTaskTwo.njk`,
  showCancelButton: false,
  translationKeys: {
    questionTitle: 'questionTitle',
    questionHint: 'questionHint',
  },

  isAnswered: req => Boolean(req.session.ccdCase?.hasRogueTaskTwo),

  fields: [
    {
      name: 'hasRogueTaskTwo',
      type: 'radio',
      required: true,
      isPageHeading: true,
      labelClasses: 'govuk-label--m',
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      errorMessage: 'errors.hasRogueTaskTwo.required',
      options: [
        {
          value: 'Yes',
          translationKey: 'options.Yes.label',
          subFields: {
            feedback: {
              name: 'feedback',
              type: 'textarea',
              required: true,
              errorMessage: 'errors.feedback.required',
              translationKey: {
                label: 'options.Yes.feedbackLabel',
              },
            },
          },
        },
        {
          value: 'No',
          translationKey: 'options.No.label',
        },
      ],
    },
  ],
});
