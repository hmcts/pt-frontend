import { flowConfig } from '../../flow.config';

import { createFormStep, getFormDataString } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccd/ccdCase.interface';

const journeyName = 'application';
const stepName = 'extra-support';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/extraSupport.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
    guidance: 'guidance',
    reasonableAdjustments: 'reasonableAdjustments',
  },
  fields: [
    {
      name: 'extraSupport',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--m',
      translationKey: { label: 'questionTitle' },
      options: [
        {
          value: 'Yes',
          translationKey: 'common:yes',
          subFields: {
            extraSupportDetails: {
              name: 'extraSupportDetails',
              type: 'textarea',
              maxLength: 500,
              required: true,
              errorMessage: 'errors.extraSupportDetails.required',
              translationKey: {
                label: 'options.extraSupportDetails.label',
              },
              validator: (value): boolean | string => {
                if (value && String(value).length > 500) {
                  return 'errors.extraSupportDetails.invalidMaxLength';
                }
                if (value && String(value).length < 2) {
                  return 'errors.extraSupportDetails.invalidMinLength';
                }
                return true;
              },
            },
          },
        },
        { value: 'No', translationKey: 'options.no.label' },
      ],
    },
  ],

  getInitialFormData: req => {
    const caseData: PTCaseData | undefined = req.session.ccdCase;
    const extraSupport: string | null | undefined =
      getFormDataString(req, 'extra-support', 'extraSupport') ?? caseData?.extraSupportDetails?.extraSupportRequired;
    const extraSupportDetails: string | undefined =
      getFormDataString(req, 'extra-support', 'extraSupportDetails') ??
      caseData?.extraSupportDetails?.extraSupportRequiredDetails;
    return {
      ...(extraSupport && { extraSupport }),
      ...(extraSupportDetails && { extraSupportDetails }),
    };
  },
});

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  if (ccdCase?.extraSupportDetails?.extraSupportRequired === 'YES') {
    return Boolean(
      ccdCase?.extraSupportDetails?.extraSupportRequired && ccdCase?.extraSupportDetails?.extraSupportRequiredDetails
    );
  }
  return ccdCase?.propertySharedWithLandlord === 'NO';
}
