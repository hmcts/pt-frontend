import { textAreaIsValidLength } from '../../../utils/fieldValidators';
import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccdCase.interface';

const journeyName = 'application';
const stepName = 'what-repairs-landlord-responsibility';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/whatRepairsLandlordResponsibility.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  translationKeys: { pageTitle: 'pageTitle' },
  fields: [
    {
      name: 'landlordRepairsResponsibility',
      type: 'textarea',
      required: false,
      isPageHeading: true,
      labelClasses: 'govuk-label--l',
      translationKey: { label: 'pageTitle', hint: 'hint' },
      validator: (value): boolean | string => {
        if (value && String(value).length > 500) {
          return 'errors.landlordRepairsResponsibility.invalid';
        }
        return true;
      },
    },
  ],
});

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  if (ccdCase?.landlordRepairsResponsibility === undefined) {
    return false;
  }
  return textAreaIsValidLength(ccdCase?.landlordRepairsResponsibility);
}
