import type { Request } from 'express';

import type { RespondToClaimStepName } from './stepRegistry';

import { getFormData } from '@modules/steps';
import type { JourneyFlowConfig, StepConfig } from '@modules/steps/stepFlow.interface';
import { isPartOfInitialRollout, isValidEnglishPostcode } from '@utils/postcode';

export const PRE_APPLICATION_ROUTE = '/pre-application';

export const flowConfig: JourneyFlowConfig = {
  basePath: PRE_APPLICATION_ROUTE,
  journeyName: 'preApplication',
  useShowConditions: true,
  useSessionFormData: true,
  nonSectionStepOrder: [],
  // First visible step of any section back-links to this hub step.
  hubStepName: 'starting-or-returning',
  stepOrder: [
    'starting-or-returning',
    'applying-for-yourself-or-someone-else',
    'you-need-to-use-another-form',
    'address-of-property',
    'you-need-to-use-another-form-postcode',
    'you-need-to-use-another-form-non-english-address',
    'landlord-is-a-housing-association',
    'you-need-to-use-another-form-landlord-association',
  ],
  steps: {
    'starting-or-returning': {
      requiresAuth: false,
      preventBack: true,
    },
    'applying-for-yourself-or-someone-else': {
      requiresAuth: false,
    },
    'you-need-to-use-another-form': {
      requiresAuth: false,
      showCondition: (req: Request) =>
        getFormData(req, 'applying-for-yourself-or-someone-else').applyingForYourselfOrSomeoneElse !== 'myself',
    },
    'address-of-property': {
      requiresAuth: false,
    },
    'you-need-to-use-another-form-postcode': {
      requiresAuth: false,
      showCondition: (req: Request) => {
        const postCode = req.session.formData?.['address-of-property']?.addressPostcode;
        return postCode && isValidEnglishPostcode(postCode) && !isPartOfInitialRollout(postCode);
      },
    },
    'you-need-to-use-another-form-non-english-address': {
      requiresAuth: false,
      showCondition: (req: Request) => {
        const postCode = req.session.formData?.['address-of-property']?.addressPostcode;
        return postCode && !isValidEnglishPostcode(postCode);
      },
    },
    'landlord-is-a-housing-association': {
      requiresAuth: false,
    },
    'you-need-to-use-another-form-landlord-association': {
      requiresAuth: false,
      showCondition: (req: Request) =>
        getFormData(req, 'landlord-is-a-housing-association').landlordIsAHousingAssociation !== 'no',
    },
  } satisfies Partial<Record<RespondToClaimStepName, StepConfig>>,
};
