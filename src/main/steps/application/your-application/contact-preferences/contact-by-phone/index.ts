import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { CcdCaseData } from '@services/ccdCase.interface';
import { isValidPhoneNumber } from '@utils/phoneNumber';

const journeyName = 'application';
const stepName = 'contact-by-phone';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/contactByPhone.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  fields: [
    {
      name: 'phoneNumberForCalls',
      type: 'text',
      required: false,
      isPageHeading: false,
      labelClasses: 'govuk-label--s',
      legendClasses: 'govuk-fieldset__legend--l',
      classes: 'govuk-input--width-10',
      translationKey: { label: 'questionLabel', hint: 'questionHint' },
      validator: (value): boolean | string => {
        if (value && !isValidPhoneNumber(value as string)) {
          return 'errors.phoneNumberForCalls.invalid';
        }
        return true;
      },
    },
  ],
});

function isAnswered(ccdCase: CcdCaseData): boolean {
  return Boolean(ccdCase.phoneNumberForCalls && isValidPhoneNumber(ccdCase.phoneNumberForCalls));
}
