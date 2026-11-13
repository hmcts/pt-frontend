import { findSectionIdForStep as findApplicationSectionId } from '../../steps/application/sections.config';
import { findSectionIdForStep as findLandlordResponseSectionId } from '../../steps/landlord-response/sections.config';

import type { JourneyFlowConfig } from '@modules/steps/stepFlow.interface';

const sectionLookups: Record<string, (stepName: string) => string | undefined> = {
  application: findApplicationSectionId,
  landlordResponse: findLandlordResponseSectionId,
};

export function findSectionIdForStep(stepName: string, flowConfig: JourneyFlowConfig): string | undefined {
  const { journeyName } = flowConfig;
  if (!journeyName) {
    return undefined;
  }
  return sectionLookups[journeyName]?.(stepName);
}
