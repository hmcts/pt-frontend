import type { RespondToClaimStepName } from './stepRegistry';

import type { JourneyFlowConfig, StepConfig } from '@modules/steps/stepFlow.interface';

export const PRE_APPLICATION_ROUTE = '/pre-application';

export const flowConfig: JourneyFlowConfig = {
  basePath: PRE_APPLICATION_ROUTE,
  journeyName: 'preApplication',
  useShowConditions: true,
  useSessionFormData: false,
  eventId: 'respondPossessionClaim',
  nonSectionStepOrder: [],
  // First visible step of any section back-links to this hub step.
  hubStepName: 'starting-or-returning',
  steps: {
    'starting-or-returning': {},
    'applying-form-yourself-or-someone-else': {},
    // 'address-of-property': {},
    // 'landlord-is-a-housing-association': {},
  } satisfies Partial<Record<RespondToClaimStepName, StepConfig>>,
};
