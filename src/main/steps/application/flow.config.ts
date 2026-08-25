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
    'council-tax-frequency': {
      showCondition: (req: Request) => getFormData(req, 'rent-includes-council-tax').rentIncludesCouncilTax === 'yes',
    },
    'utilities-paid-frequency': {
      showCondition: (req: Request) =>
        getFormData(req, 'rent-inclusive-of-utility-charges').rentInclusiveOfUtilityCharges === 'yes',
    },
    'landlord-letting-agent-email-address': {
      showCondition: (req: Request) => {
        const answer = getFormData(
          req,
          'landlord-has-letting-agent-or-representative'
        ).landlordHasLettingAgentOrRepresentative;
        return answer === 'lettingAgentOnly' || answer === 'lettingAgentAndRepresentative';
      },
    },
    'landlord-letting-agent-phone-number': {
      showCondition: (req: Request) => {
        const answer = getFormData(
          req,
          'landlord-has-letting-agent-or-representative'
        ).landlordHasLettingAgentOrRepresentative;
        return answer === 'lettingAgentOnly' || answer === 'lettingAgentAndRepresentative';
      },
    },
    'landlord-representative-details': {
      showCondition: (req: Request) => {
        const answer = getFormData(
          req,
          'landlord-has-letting-agent-or-representative'
        ).landlordHasLettingAgentOrRepresentative;
        return answer === 'representativeOnly' || answer === 'lettingAgentAndRepresentative';
      },
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
