import type { Request } from 'express';

import { applicationSections } from './sections.config';
import type { ApplicationStepName } from './stepRegistry';

import { getFormData } from '@modules/steps';
import type { JourneyFlowConfig, StepConfig } from '@modules/steps/stepFlow.interface';

export const APPLICATION_ROUTE = '/:caseReference';

export const flowConfig: JourneyFlowConfig = {
  basePath: APPLICATION_ROUTE,
  journeyName: 'application',
  useShowConditions: true,
  useSessionFormData: true,
  sections: applicationSections,
  nonSectionStepOrder: ['task-list'],
  // First visible step of any section back-links to this hub step.
  hubStepName: 'task-list',
  steps: {
    'upload-floor-plan-of-property': {
      showCondition: (req: Request) => getFormData(req, 'floor-plan-of-property').hasFloorPlanOfProperty === 'yes',
    },
    'upload-evidence-improvements-or-repairs': {
      showCondition: (req: Request) => getFormData(req, 'repairs-and-improvements').hasRepairsAndImprovements === 'yes',
    },
    'landlord-representative-email-address': {
      showCondition: (req: Request) => hasLandlordRepresentative(req),
    },
    'landlord-representative-phone-number': {
      showCondition: (req: Request) => hasLandlordRepresentative(req),
    },
  } satisfies Partial<Record<ApplicationStepName, StepConfig>>,
};

function hasLandlordRepresentative(req: Request): boolean {
  const answer = getFormData(
    req,
    'landlord-has-letting-agent-or-representative'
  ).landlordHasLettingAgentOrRepresentative;
  return ['representativeOnly', 'lettingAgentAndRepresentative'].includes(answer as string);
}
