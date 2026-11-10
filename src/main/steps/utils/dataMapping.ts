import type { Request } from 'express';

import { prepareApplicationDataForSave } from '../application/dataMapping';
import { prepareLandlordResponseDataForSave } from '../landlord-response/dataMapping';

import type { JourneyFlowConfig } from '@modules/steps/stepFlow.interface';
import type { PTCaseData } from '@services/ccd/ccdCase.interface';

type SectionDataMapper = (sectionId: string, req: Request, ccdCase: PTCaseData | undefined) => Record<string, unknown>;

const sectionDataMappers: Record<string, SectionDataMapper> = {
  application: prepareApplicationDataForSave,
  landlordResponse: prepareLandlordResponseDataForSave,
};

export function prepareDataForSave(
  sectionId: string,
  req: Request,
  ccdCase: PTCaseData | undefined,
  flowConfig: JourneyFlowConfig
): Record<string, unknown> {
  const { journeyName } = flowConfig;
  if (!journeyName) {
    return {};
  }
  return sectionDataMappers[journeyName]?.(sectionId, req, ccdCase) ?? {};
}
