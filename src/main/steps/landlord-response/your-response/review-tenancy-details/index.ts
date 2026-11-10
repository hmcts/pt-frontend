import { textAreaIsValidLength } from '../../../utils/fieldValidators';
import { flowConfig } from '../../flow.config';

import { buildTenancyDetailsRows } from './buildTenancyDetailsRows';

import { createFormStep, getFormData, getFormDataString, getStepUrl, getTranslationFunction } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import type { PTCaseData } from '@services/ccd/ccdCase.interface';

const journeyName = 'landlord-response';
const stepName = 'review-tenancy-details';

const fieldName = 'respondToTenantAnswersAboutTenancyDetails';
const detailsFieldName = 'respondToTenantAnswersAboutTenancyDetailsDescription';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/reviewTenancyDetails.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
  translationKeys: {
    pageTitle: 'pageTitle',
  },
  extendGetContent: req => ({
    viewTenantsApplicationUrl: getStepUrl('view-tenants-application', flowConfig, String(req.params.caseReference)),
    tenancyDetailsRows: buildTenancyDetailsRows(req, getTranslationFunction(req)),
  }),
  beforeRedirect: req => {
    const stepData = getFormData(req, stepName);
    if (stepData[fieldName] !== 'Yes') {
      stepData[`${fieldName}.${detailsFieldName}`] = '';
    }
  },
  fields: [
    {
      name: fieldName,
      type: 'radio',
      required: true,
      isPageHeading: false,
      legendClasses: 'govuk-fieldset__legend--m',
      translationKey: { label: 'questionTitle', hint: 'questionHint' },
      errorMessage: `errors.${fieldName}.required`,
      options: [
        {
          value: 'Yes',
          translationKey: 'common:yes',
          subFields: {
            [detailsFieldName]: {
              name: detailsFieldName,
              type: 'textarea',
              required: true,
              labelClasses: 'govuk-label--s',
              translationKey: { label: 'details.label', hint: 'details.hint' },
              errorMessage: `errors.${detailsFieldName}.required`,
              validator: (value): boolean | string =>
                textAreaIsValidLength(value as string) ? true : `errors.${detailsFieldName}.invalid`,
            },
          },
        },
        { value: 'No', translationKey: 'common:no' },
      ],
    },
  ],
  getInitialFormData: req => {
    const saved = req.session.ccdCase?.landlordResponse;
    const answer = getFormDataString(req, stepName, fieldName) ?? saved?.[fieldName];
    const details =
      getFormDataString(req, stepName, `${fieldName}.${detailsFieldName}`) ??
      (answer === 'Yes' ? saved?.[detailsFieldName] : undefined);

    return {
      ...(answer && { [fieldName]: answer }),
      ...(details && { [`${fieldName}.${detailsFieldName}`]: details }),
    };
  },
});

export function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  const response = ccdCase?.landlordResponse;
  if (response?.[fieldName] === 'Yes') {
    return Boolean(response[detailsFieldName]);
  }
  return response?.[fieldName] === 'No';
}
