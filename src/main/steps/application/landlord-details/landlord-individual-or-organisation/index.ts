import { flowConfig } from '../../flow.config';

import { createFormStep, getFormData } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { isValidPersonName } from '@utils/personName';

const journeyName = 'application';
const stepName = 'landlord-individual-or-organisation';

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
      isPageHeading: false,
      legendClasses: 'govuk-fieldset__legend--m',
      translationKey: { label: 'subheading' },
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
              validator: (value): boolean | string => {
                if (value && (String(value).length < 2 || String(value).length > 50)) {
                  return String(value).length < 2 ? 'errors.landlordName.tooShort' : 'errors.landlordName.tooLong';
                }
                if (value && !isValidPersonName(value as string)) {
                  return 'errors.landlordFirstName.invalid';
                }
                return true;
              },
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
              validator: (value): boolean | string => {
                if (value && (String(value).length < 2 || String(value).length > 50)) {
                  return String(value).length < 2 ? 'errors.landlordName.tooShort' : 'errors.landlordName.tooLong';
                }
                if (value && !isValidPersonName(value as string)) {
                  return 'errors.landlordLastName.invalid';
                }
                return true;
              },
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
              validator: (value): boolean | string => {
                if (value && (String(value).length < 2 || String(value).length > 50)) {
                  return String(value).length < 2 ? 'errors.landlordName.tooShort' : 'errors.landlordName.tooLong';
                }
                return true;
              },
            },
          },
        },
      ],
    },
  ],
});
