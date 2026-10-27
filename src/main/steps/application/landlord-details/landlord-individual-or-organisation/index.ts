import { getTextLenghtError } from '../../../utils/fieldValidators';
import { flowConfig } from '../../flow.config';

import { createFormStep, getFormData } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { isValidPersonName } from '@utils/personName';

const journeyName = 'application';
const stepName = 'landlord-individual-or-organisation';

const validateLanlordNameLength = (value: unknown): boolean | string => {
  const error = getTextLenghtError(value as string, 2, 50);
  if (error === 'tooShort') {
    return 'errors.landlordName.tooShort';
  }
  if (error === 'tooLong') {
    return 'errors.landlordName.tooLong';
  }
  return true;
};

const validatePersonName = (value: unknown, invalidErrorMessage: string): boolean | string => {
  const lengthError = validateLanlordNameLength(value);
  if (lengthError !== true) {
    return lengthError;
  }

  if (value && !isValidPersonName(value as string)) {
    return invalidErrorMessage;
  }

  return true;
};

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/landlordIndividualOrOrganisation.njk`,
  showCancelButton: false,
  isAnswered: req => Boolean(req.session.ccdCase?.landlordIndividualOrOrganisation),
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
    subheading: 'subheading',
  },
  beforeRedirect: req => {
    const stepData = getFormData(req, stepName);

    if (stepData?.landlordIndividualOrOrganisation !== 'individual') {
      delete stepData['landlordIndividualOrOrganisation.landlordFirstName'];
      delete stepData['landlordIndividualOrOrganisation.landlordLastName'];
    }

    if (stepData?.landlordIndividualOrOrganisation !== 'organisation') {
      delete stepData['landlordIndividualOrOrganisation.landlordOrganisationName'];
    }
  },
  fields: [
    {
      name: 'landlordIndividualOrOrganisation',
      type: 'radio',
      required: true,
      isPageHeading: true,
      legendClasses: 'govuk-fieldset__legend--l',
      translationKey: { label: 'heading', hint: 'subheading' },
      errorMessage: 'errors.landlordIndividualOrOrganisation.required',
      options: [
        {
          value: 'individual',
          translationKey: 'options.individual.label',
          hint: 'options.individual.hint',
          subFields: {
            landlordFirstName: {
              name: 'landlordFirstName',
              type: 'text',
              required: true,
              isPageHeading: false,
              maxLength: 50,
              translationKey: { label: 'landlordFirstName.label' },
              errorMessage: 'errors.landlordFirstName.required',
              attributes: {
                autocomplete: 'given-name',
                spellcheck: false,
              },
              validator: value => validatePersonName(value, 'errors.landlordFirstName.invalid'),
            },
            landlordLastName: {
              name: 'landlordLastName',
              type: 'text',
              required: true,
              isPageHeading: false,
              maxLength: 50,
              translationKey: { label: 'landlordLastName.label' },
              errorMessage: 'errors.landlordLastName.required',
              attributes: {
                autocomplete: 'family-name',
                spellcheck: false,
              },
              validator: value => validatePersonName(value, 'errors.landlordLastName.invalid'),
            },
          },
        },
        {
          value: 'organisation',
          translationKey: 'options.organisation.label',
          hint: 'options.organisation.hint',
          subFields: {
            landlordOrganisationName: {
              name: 'landlordOrganisationName',
              type: 'text',
              required: true,
              maxLength: 50,
              translationKey: { label: 'landlordOrganisationName.label' },
              errorMessage: 'errors.landlordOrganisationName.required',
              attributes: {
                autocomplete: 'organization',
              },
              validator: validateLanlordNameLength,
            },
          },
        },
      ],
    },
  ],
});
