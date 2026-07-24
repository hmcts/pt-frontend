import { applicationSections } from './sections.config';
import type { ApplicationStepName } from './stepRegistry';

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
  steps: {} satisfies Partial<Record<ApplicationStepName, StepConfig>>,
};
