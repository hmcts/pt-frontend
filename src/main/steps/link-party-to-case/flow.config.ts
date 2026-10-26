import { LinkPartyToCaseStepName } from './stepRegistry';

import { JourneyFlowConfig, type StepConfig } from '@modules/steps/stepFlow.interface';

export const LINK_PARTY_TO_CASE = '/link-party-to-case';

export const flowConfig: JourneyFlowConfig = {
  basePath: LINK_PARTY_TO_CASE,
  journeyName: 'linkPartyToCase',
  useShowConditions: true,
  useSessionFormData: false,
  nonSectionStepOrder: [],
  // First visible step of any section back-links to this hub step.
  hubStepName: 'enter-access-code',
  stepOrder: ['enter-access-code', 'success'],
  steps: {
    'enter-access-code': {
      requiresAuth: true,
      preventBack: false,
    },
    success: {
      requiresAuth: true,
      preventBack: true,
    },
  } satisfies Partial<Record<LinkPartyToCaseStepName, StepConfig>>,
};
