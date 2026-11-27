import { flowConfig } from '../../flow.config';

import { createFormStep, getFormDataString } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccd/ccdCase.interface';

const journeyName = 'application';
const stepName = 'landlord-has-representative';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/landlordHasRepresentative.njk`,
  showCancelButton: false,
  translationKeys: {
    pageTitle: 'questionTitle',
  },
  isAnswered: req => Boolean(req.session.ccdCase?.landlordDetails?.hasRepresentative),
  fields: [
    {
      name: 'landlordHasRepresentative',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      errorMessage: 'errors.landlordHasRepresentative.required',
      options: [
        { value: 'Yes', translationKey: 'common:yes' },
        { value: 'No', translationKey: 'common:no' },
        { value: 'NotSure', translationKey: 'common:notSure' },
      ],
    },
  ],
  getInitialFormData: req => {
    const caseData: PTCaseData | undefined = req.session.ccdCase;

    const landlordHasRepresentative =
      getFormDataString(req, stepName, 'landlordHasRepresentative') ?? caseData?.landlordDetails?.hasRepresentative;

    return {
      ...(landlordHasRepresentative && { landlordHasRepresentative }),
    };
  },
});
