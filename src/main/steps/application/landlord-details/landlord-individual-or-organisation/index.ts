import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const journeyName = 'application';
const stepName = 'landlord-individual-or-organisation';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/landlordIndividualOrOrganisation.njk`,
  showCancelButton: false,
  isAnswered: () => false,
  translationKeys: {
    pageTitle: 'pageTitle',
    heading: 'heading',
    subheading: 'subheading',
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
            },
          },
        },
      ],
    },
  ],
});
