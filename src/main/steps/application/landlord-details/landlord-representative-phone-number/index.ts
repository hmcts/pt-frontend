import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { isValidPhoneNumber } from '@utils/phoneNumber';

const journeyName = 'application';
const stepName = 'landlord-representative-phone-number';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/landlordRepresentativePhoneNumber.njk`,
  showCancelButton: false,
  isAnswered: req =>
    Boolean(
      req.session.ccdCase?.representativePhoneNumber &&
      isValidPhoneNumber(req.session.ccdCase.representativePhoneNumber)
    ),
  translationKeys: {
    pageTitle: 'pageTitle',
  },
  fields: [
    {
      name: 'representativePhoneNumber',
      type: 'text',
      required: false,
      isPageHeading: true,
      labelClasses: 'govuk-label--l',
      classes: 'govuk-input--width-20',
      translationKey: { label: 'heading' },
      validator: (value): boolean | string => {
        if (value && !isValidPhoneNumber(value as string)) {
          return 'errors.representativePhoneNumber.invalid';
        }
        return true;
      },
    },
  ],
});
