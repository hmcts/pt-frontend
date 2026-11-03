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
        },
        { value: 'No', translationKey: 'options.no.label' },
      ],
    },
  ],

  getInitialFormData: req => {
    const caseData: PTCaseData | undefined = req.session.ccdCase;
    const extraSupport: string | boolean | undefined =
      getFormDataString(req, 'extra-support', 'extraSupport') ?? caseData?.extraSupportDetails?.extraSupportRequired;
    return {
      ...(extraSupport && { extraSupport }),
    };
  },
});

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  const answer = ccdCase?.extraSupportDetails?.extraSupportRequired;
  return answer === 'Yes' || answer === 'No';
}
