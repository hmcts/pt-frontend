import { textAreaIsValidLength } from '../../../../utils/fieldValidators';
import { flowConfig } from '../../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccdCase.interface';

const journeyName = 'application';
const stepName = 'have-tenancy-agreement';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/haveTenancyAgreement.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  translationKeys: {
    pageTitle: 'pageTitle',
  },
  fields: [
    {
      name: 'hasTenancyAgreement',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'heading' },
      errorMessage: 'errors.hasTenancyAgreement.required',
      options: [
        { value: 'yes', translationKey: 'common:yes' },
        {
          value: 'no',
          translationKey: 'common:no',
          subFields: {
            noTenancyAgreementReason: {
              name: 'noTenancyAgreementReason',
              type: 'textarea',
              maxLength: 500,
              required: true,
              errorMessage: 'errors.noTenancyAgreementReason.required',
              translationKey: { label: 'options.noTenancyAgreementReason.label' },
              validator: (value): boolean | string =>
                textAreaIsValidLength(value as string) ? true : 'errors.noTenancyAgreementReason.invalid',
            },
          },
        },
      ],
    },
  ],
});

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  if (!ccdCase) {
    return false;
  }

  const { hasTenancyAgreement, noTenancyAgreementReason } = ccdCase;
  if (hasTenancyAgreement === 'no') {
    return Boolean(noTenancyAgreementReason && textAreaIsValidLength(noTenancyAgreementReason));
  }
  return hasTenancyAgreement === 'yes';
}
