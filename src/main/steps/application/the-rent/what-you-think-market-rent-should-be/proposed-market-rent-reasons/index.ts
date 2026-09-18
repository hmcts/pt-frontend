import { textAreaIsValidLength } from '../../../../utils/fieldValidators';
import { flowConfig } from '../../../flow.config';

import { createFormStep, getFormDataString } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccdCase.interface';

const journeyName = 'application';
const stepName = 'proposed-market-rent-reasons';

const fieldName = 'applicantSuggestedMarketRentReasons';

const maxLength = 5000;

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/proposedMarketRentReasons.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  translationKeys: { pageTitle: 'pageTitle' },
  fields: [
    {
      name: fieldName,
      type: 'character-count',
      required: false,
      isPageHeading: false,
      labelClasses: 'govuk-label--m',
      maxLength,
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      validator: (value: unknown): boolean | string => {
        if (!textAreaIsValidLength(value as string, maxLength)) {
          return `errors.${fieldName}.invalid`;
        }
        return true;
      },
    },
  ],
  getInitialFormData: req => {
    const value = getFormDataString(req, stepName, fieldName) ?? req.session.ccdCase?.marketRentDetails?.[fieldName];

    return {
      ...(value && { [fieldName]: value }),
    };
  },
});

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  if (ccdCase?.marketRentDetails?.applicantSuggestedMarketRentReasons === undefined) {
    return false;
  }
  return textAreaIsValidLength(ccdCase?.marketRentDetails?.applicantSuggestedMarketRentReasons, maxLength);
}
