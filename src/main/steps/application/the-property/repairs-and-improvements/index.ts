import { flowConfig } from '../../flow.config';

import { createFormStep, getFormDataString } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccd/ccdCase.interface';

const journeyName = 'application';
const stepName = 'repairs-and-improvements';
const fieldName = 'anyTenantsMadePropertyRepairs';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/repairsAndImprovements.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  fields: [
    {
      name: 'anyTenantsMadePropertyRepairs',
      type: 'radio',
      required: true,
      isPageHeading: false,
      legendClasses: 'govuk-fieldset__legend--m',
      translationKey: { label: 'questionTitle', hint: 'questionParagraph' },
      hintClasses: 'govuk-body',
      options: [
        {
          value: 'Yes',
          translationKey: 'common:yes',
          subFields: {
            tenantsPropertyRepairsDetails: {
              name: 'tenantsPropertyRepairsDetails',
              type: 'textarea',
              maxLength: 500,
              required: true,
              errorMessage: 'errors.tenantsPropertyRepairsDetails.required',
              translationKey: {
                label: 'options.tenantsPropertyRepairsDetails.label',
                hint: 'options.tenantsPropertyRepairsDetails.hint',
              },
              validator: (value): boolean | string => {
                if (value && String(value).length > 500) {
                  return 'errors.tenantsPropertyRepairsDetails.invalid';
                }
                return true;
              },
            },
          },
        },
        { value: 'No', translationKey: 'common:no' },
        { value: 'NotSure', translationKey: 'options.notSure.label' },
      ],
    },
  ],
  getInitialFormData: req => {
    const propertyDetails = req.session.ccdCase?.propertyDetails;
    const value = getFormDataString(req, stepName, fieldName) ?? propertyDetails?.[fieldName];
    const tenantsPropertyRepairsDetails =
      getFormDataString(req, stepName, `${fieldName}.tenantsPropertyRepairsDetails`) ??
      (value === 'Yes' ? propertyDetails?.tenantsPropertyRepairsDetails : undefined);

    return {
      ...(value && { [fieldName]: value }),
      ...(tenantsPropertyRepairsDetails && {
        [`${fieldName}.tenantsPropertyRepairsDetails`]: tenantsPropertyRepairsDetails,
      }),
    };
  },
});

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  const propertyDetails = ccdCase?.propertyDetails;

  if (propertyDetails?.anyTenantsMadePropertyRepairs === 'Yes') {
    return Boolean(propertyDetails?.tenantsPropertyRepairsDetails?.trim());
  }
  return Boolean(propertyDetails?.anyTenantsMadePropertyRepairs);
}
