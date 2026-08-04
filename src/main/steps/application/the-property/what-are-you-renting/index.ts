import { flowConfig } from '../../flow.config';

import { createFormStep } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { CcdCaseData } from '@services/ccdCase.interface';

const journeyName = 'application';
const stepName = 'what-are-you-renting';

export const step: StepDefinition = createFormStep({
  stepName,
  journeyFolder: journeyName,
  stepDir: __dirname,
  flowConfig,
  customTemplate: `${__dirname}/whatAreYouRenting.njk`,
  showCancelButton: false,
  isAnswered: req => isAnswered(req.session.ccdCase),
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
          value: 'roomOrRooms',
          translationKey: 'options.roomOrRooms.label',
          subFields: {
            roomOrRoomsDescription: {
              name: 'propertyTypeRoomDescription',
              type: 'textarea',
              maxLength: 500,
              required: false,
              errorMessage: 'errors.textUpdatesPhoneNumber.required',
              translationKey: {
                label: 'options.roomOrRooms.roomOrRoomsDescriptionLabel',
                hint: 'options.roomOrRooms.roomOrRoomsDescriptionHint',
              },
              validator: (value): boolean | string => {
                if (value && String(value).length > 500) {
                  return 'errors.roomOrRoomsDescription.invalid';
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
              name: 'propertyTypeFlatFloor',
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
        { value: 'terraced', translationKey: 'options.terraced.label' },
        { value: 'semiDetached', translationKey: 'options.semiDetached.label', hint: 'options.semiDetached.hint' },
        { value: 'detached', translationKey: 'options.detached.label', hint: 'options.detached.hint' },
        {
          value: 'other',
          translationKey: 'options.other.label',
          subFields: {
            otherDescription: {
              name: 'propertyTypeOtherDescription',
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

function isAnswered(ccdCase: CcdCaseData): boolean {
  const { propertyType, propertyTypeRoomDescription, propertyTypeFlatFloor, propertyTypeOtherDescription } = ccdCase;

  switch (propertyType) {
    case 'terraced':
    case 'semiDetached':
    case 'detached':
      return true;
    case 'roomOrRooms':
      return isValidLength(propertyTypeRoomDescription);
    case 'flat':
      return isValidLength(propertyTypeFlatFloor);
    case 'other':
      return Boolean(propertyTypeOtherDescription);
    default:
      return false;
  }
}

/**
 * Validates whether a text box should be marked as isAnswered
 * If the optional text box was left blank - isAnswered = true
 * If the optional text box was filled with text and is less than max value of 500 - isAnswered = true
 *
 * @param value - string entered for given text box
 * @param max - maximum valid length
 */
function isValidLength(value: string | undefined, max = 500): boolean {
  return !value || String(value).length <= max;
}
