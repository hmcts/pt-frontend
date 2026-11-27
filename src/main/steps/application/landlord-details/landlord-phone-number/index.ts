import { flowConfig } from '../../flow.config';

import { createFormStep, getFormDataString } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccd/ccdCase.interface';
import { isValidPhoneNumber } from '@utils/phoneNumber';

const journeyName = 'application';
const stepName = 'landlord-phone-number';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/landlordPhoneNumber.njk`,
  showCancelButton: false,
  fields: [
    {
      name: 'landlordPhoneNumber',
      type: 'text',
      required: false,
      isPageHeading: true,
      labelClasses: 'govuk-label--l',
      legendClasses: 'govuk-fieldset__legend--l',
      classes: 'govuk-input--width-10',
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      validator: (value): boolean | string => {
        if (value && !isValidPhoneNumber(value as string)) {
          return 'errors.landlordPhoneNumber.invalid';
        }
        return true;
      },
    },
  ],
  getInitialFormData: req => {
    const caseData: PTCaseData | undefined = req.session.ccdCase;

    const landlordPhoneNumber =
      getFormDataString(req, stepName, 'landlordPhoneNumber') ?? caseData?.landlordDetails?.landlord?.phoneNumber;

    return {
      ...(landlordPhoneNumber && { landlordPhoneNumber }),
    };
  },
});
