import type { Request } from 'express';

import { landlordResponseSections } from './sections.config';
import type { LandlordResponseStepName } from './stepRegistry';

import { getFormData } from '@modules/steps';
import type { JourneyFlowConfig, StepConfig } from '@modules/steps/stepFlow.interface';

export const LANDLORD_RESPONSE_ROUTE = '/:caseReference/landlord-response';

export const flowConfig: JourneyFlowConfig = {
  basePath: LANDLORD_RESPONSE_ROUTE,
  journeyName: 'landlordResponse',
  useShowConditions: true,
  useSessionFormData: true,
  sections: landlordResponseSections,
  nonSectionStepOrder: ['task-list'],
  // First visible step of any section back-links to this hub step.
  hubStepName: 'task-list',
  steps: {
    'served-notice-proposing-new-rent': {
      showCondition: (req: Request) => req.session.ccdCase?.applicationType === 'challengeRentIncrease',
    },
    'upload-evidence-tenancy-details': {
      showCondition: (req: Request) =>
        getFormData(req, 'review-tenancy-details').respondToTenantAnswersAboutTenancyDetails === 'Yes',
    },
  } satisfies Partial<Record<LandlordResponseStepName, StepConfig>>,
};
