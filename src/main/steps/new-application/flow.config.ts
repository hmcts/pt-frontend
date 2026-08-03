import type { RespondToClaimStepName } from './stepRegistry';

import type { JourneyFlowConfig, StepConfig } from '@modules/steps/stepFlow.interface';

export const NEW_APPLICATION_ROUTE = '/new-application';

export const flowConfig: JourneyFlowConfig = {
  basePath: NEW_APPLICATION_ROUTE,
  journeyName: 'preApplication',
  useShowConditions: true,
  useSessionFormData: true,
  nonSectionStepOrder: [],
  // First visible step of any section back-links to this hub step.
  hubStepName: 'application-type',
  stepOrder: ['application-type', 'tenancy-type'],
  steps: {
    'application-type': {
      requiresAuth: true,
      preventBack: true,
    },
    'tenancy-type': {
      requiresAuth: true,
    },
  } satisfies Partial<Record<RespondToClaimStepName, StepConfig>>,
};
