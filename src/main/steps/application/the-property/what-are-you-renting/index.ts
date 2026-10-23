import { textAreaIsValidLength } from '../../../utils/fieldValidators';
import { flowConfig } from '../../flow.config';
import { getValidatedCase } from '../../section-cya/cyaRow';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { PTCaseData } from '@services/ccd/ccdCase.interface';

const journeyName = 'application';
const stepName = 'what-are-you-renting';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/whatAreYouRenting.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(getValidatedCase(req)),
  fields: [
    {
      name: 'propertyType',
      type: 'radio',
      required: true,
      isPageHeading: false,
      legendClasses: 'govuk-fieldset__legend--m',
      translationKey: { label: 'questionTitle' },
      options: [
        {
          value: 'room',
          translationKey: 'options.room.label',
          subFields: {
            roomDescription: {
              name: 'rentingRoomDetails',
              type: 'textarea',
              maxLength: 500,
              required: false,
              errorMessage: 'errors.textUpdatesPhoneNumber.required',
              translationKey: {
                label: 'options.room.roomDescriptionLabel',
                hint: 'options.room.roomDescriptionHint',
              },
              validator: (value): boolean | string => {
                if (value && String(value).length > 500) {
                  return 'errors.roomDescription.invalid';
                }
                return true;
              },
            },
          },
        },
        {
          value: 'flat',
          translationKey: 'options.flat.label',
          subFields: {
            flatFloor: {
              name: 'rentingFlatDetails',
              type: 'text',
              maxLength: 500,
              required: false,
              classes: 'govuk-input--width-10',
              translationKey: {
                label: 'options.flat.flatFloor',
              },
              validator: (value): boolean | string => {
                if (value && String(value).length > 500) {
                  return 'errors.flatFloor.invalid';
                }
                return true;
              },
            },
          },
        },
        { value: 'terracedHouse', translationKey: 'options.terracedHouse.label' },
        {
          value: 'semiDetachedHouse',
          translationKey: 'options.semiDetachedHouse.label',
          hint: 'options.semiDetachedHouse.hint',
        },
        {
          value: 'fullyDetachedHouse',
          translationKey: 'options.fullyDetachedHouse.label',
          hint: 'options.fullyDetachedHouse.hint',
        },
        {
          value: 'other',
          translationKey: 'options.other.label',
          subFields: {
            otherDescription: {
              name: 'otherMethodRentingDetails',
              type: 'textarea',
              maxLength: 500,
              required: true,
              errorMessage: 'errors.otherDescription.required',
              translationKey: {
                label: 'options.other.otherDescriptionLabel',
                hint: 'options.other.otherDescriptionHint',
              },
              validator: (value): boolean | string => {
                if (value && String(value).length > 500) {
                  return 'errors.otherDescription.invalid';
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

function isAnswered(ccdCase: PTCaseData | undefined): boolean {
  const propertyDetails = ccdCase?.propertyDetails;

  if (!propertyDetails) {
    return false;
  }

  const { propertyType, rentingRoomDetails, rentingFlatDetails, otherMethodRentingDetails } = propertyDetails;

  switch (propertyType) {
    case 'terracedHouse':
    case 'semiDetachedHouse':
    case 'fullyDetachedHouse':
      return true;
    case 'room':
      return textAreaIsValidLength(rentingRoomDetails);
    case 'flat':
      return textAreaIsValidLength(rentingFlatDetails);
    case 'other':
      return Boolean(otherMethodRentingDetails);
    default:
      return false;
  }
}
