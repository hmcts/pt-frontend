import { textAreaIsValidLength } from '../../../../utils/fieldValidators';
import { flowConfig } from '../../../flow.config';

import { createFormStep, getFormDataString } from '@modules/steps';
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
      name: 'copyOfTenancyAgreement',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'heading' },
      errorMessage: 'errors.copyOfTenancyAgreement.required',
      options: [
        { value: 'Yes', translationKey: 'common:yes' },
        {
          value: 'No',
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
  getInitialFormData: req => {
    const caseData: PTCaseData | undefined = req.session.ccdCase;
    const copyOfTenancyAgreement: string | undefined =
      getFormDataString(req, 'have-tenancy-agreement', 'copyOfTenancyAgreement') ??
      caseData?.tenancyAgreementDetails?.copyOfTenancyAgreement;
    const noTenancyAgreementReason: string | undefined =
      getFormDataString(req, 'have-tenancy-agreement', 'copyOfTenancyAgreement.noTenancyAgreementReason') ??
      caseData?.tenancyAgreementDetails?.noTenancyAgreementReason;

    return {
      ...(copyOfTenancyAgreement && { copyOfTenancyAgreement }),
      ...(noTenancyAgreementReason && {
        'copyOfTenancyAgreement.noTenancyAgreementReason': noTenancyAgreementReason,
      }),
    };
  },
});

export function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  const tenancyAgreementDetails = ccdCase?.tenancyAgreementDetails;
  if (!tenancyAgreementDetails) {
    return false;
  }

  const { copyOfTenancyAgreement, noTenancyAgreementReason } = tenancyAgreementDetails;
  if (copyOfTenancyAgreement === 'No') {
    return Boolean(noTenancyAgreementReason && textAreaIsValidLength(noTenancyAgreementReason));
  }
  return copyOfTenancyAgreement === 'Yes';
}
