import { flowConfig } from '../../flow.config';

import { createFormStep, getFormDataString } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccd/ccdCase.interface';
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
  getInitialFormData: req => {
    const caseData: PTCaseData | undefined = req.session.ccdCase;

    const representativePhoneNumber =
      getFormDataString(req, stepName, 'representativePhoneNumber') ??
      caseData?.landlordDetails?.representative?.phoneNumber;

    return {
      ...(representativePhoneNumber && { representativePhoneNumber }),
    };
  },
});
