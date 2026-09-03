import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccdCase.interface';
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
  translationKeys: {
    pageTitle: 'pageTitle',
    contactByPhoneInfo: 'contactByPhoneInfo',
  },
  isAnswered: () => true,
  fields: [
    {
      name: 'phoneNumberForCalls',
      type: 'text',
      required: false,
      isPageHeading: false,
      labelClasses: 'govuk-label--m',
      legendClasses: 'govuk-fieldset__legend--l',
      classes: 'govuk-input--width-10',
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      validator: (value): boolean | string => {
        if (value && !isValidPhoneNumber(value as string)) {
          return 'errors.phoneNumberForCalls.invalid';
        }
        return true;
      },
    },
  ],
  getInitialFormData: req => {
    const formData = req.session.formData;
    const caseData: PTCaseData | undefined = req.session.ccdCase;
    const phoneNumberForCalls: string | undefined =
      formData?.['contact-by-phone']?.phoneNumberForCalls ?? caseData?.applicantContactPreferences?.phoneNumber;

    return {
      ...(phoneNumberForCalls && { phoneNumberForCalls }),
    };
  },
});
