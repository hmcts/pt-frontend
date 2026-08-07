import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'application';
const stepName = 'repairs-and-improvements';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/repairsAndImprovements.njk`,
  showCancelButton: false,
  isAnswered: req => Boolean(req.session.ccdCase?.hasRepairsAndImprovements),
  fields: [
    {
      name: 'hasRepairsAndImprovements',
      type: 'radio',
      required: true,
      isPageHeading: false,
      legendClasses: 'govuk-fieldset__legend--m',
      translationKey: { label: 'questionTitle' },
      options: [
        { value: 'yes', translationKey: 'common:yes' },
        { value: 'no', translationKey: 'common:no' },
        { value: 'notSure', translationKey: 'options.notSure.label' },
      ],
    },
  ],
});
