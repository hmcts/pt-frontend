import { textAreaIsValidLength } from '../../../../utils/fieldValidators';
import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { CcdCaseData } from '@services/ccdCase.interface';

const journeyName = 'application';
const stepName = 'other-household-management-charges-details';

const fieldName = 'otherHouseholdManagementChargesDetails';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/otherHouseholdManagementChargesDetails.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  translationKeys: { pageTitle: 'pageTitle' },
  fields: [
    {
      name: fieldName,
      type: 'textarea',
      required: false,
      isPageHeading: false,
      labelClasses: 'govuk-label--m',
      maxLength: 500,
      translationKey: { label: 'questionTitle' },
      validator: (value: unknown): boolean | string => {
        if (!textAreaIsValidLength(value as string)) {
          return `errors.${fieldName}.invalid`;
        }
        return true;
      },
    },
  ],
});

function isAnswered(ccdCase: CcdCaseData): boolean {
  if (ccdCase.otherHouseholdManagementChargesDetails === undefined) {
    return false;
  }
  return textAreaIsValidLength(ccdCase.otherHouseholdManagementChargesDetails);
}
