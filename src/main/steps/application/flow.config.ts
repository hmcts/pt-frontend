import { applicationSections } from './sections.config';
import type { ApplicationStepName } from './stepRegistry';

import type { JourneyFlowConfig, StepConfig } from '@modules/steps/stepFlow.interface';

export const APPLICATION_ROUTE = '/case/:caseReference/application';

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
    'task-list': { requiresAuth: false },
    'application-type': { requiresAuth: false },
    'contact-preferences': { requiresAuth: false },
    'who-is-on-the-tenancy': { requiresAuth: false },
    'landlord-details': { requiresAuth: false },
    'landlords-notice': { requiresAuth: false },
    'tenancy-agreement': { requiresAuth: false },
    'current-rent-and-other-costs': { requiresAuth: false },
    'market-rent': { requiresAuth: false },
    'property-details': { requiresAuth: false },
    'inspection-and-hearing': { requiresAuth: false },
    'support-for-health-conditions': { requiresAuth: false },
    'help-with-fees': { requiresAuth: false },
    'check-your-answers-and-submit': { requiresAuth: false },
  } satisfies Partial<Record<ApplicationStepName, StepConfig>>,
};
