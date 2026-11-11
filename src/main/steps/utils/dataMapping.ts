import type { Request } from 'express';

import { prepareApplicationDataForSave } from '../application/dataMapping';
import { prepareLandlordResponseDataForSave } from '../landlord-response/dataMapping';

import type { JourneyFlowConfig } from '@modules/steps/stepFlow.interface';
import { getCaseApi } from '@services/ccd/ccdApiClient';
import { CITIZEN_UPDATE_CASE, type PTCaseData, RESPONDENT_UPDATE_RESPONSE } from '@services/ccd/ccdCase.interface';

type SectionDataMapper = (sectionId: string, req: Request, ccdCase: PTCaseData | undefined) => Record<string, unknown>;

interface JourneySaveConfig {
  mapData: SectionDataMapper;
  eventId: string;
}

const journeySaveConfigs: Record<string, JourneySaveConfig> = {
  application: { mapData: prepareApplicationDataForSave, eventId: CITIZEN_UPDATE_CASE },
  landlordResponse: { mapData: prepareLandlordResponseDataForSave, eventId: RESPONDENT_UPDATE_RESPONSE },
};

function getJourneySaveConfig(flowConfig: JourneyFlowConfig): JourneySaveConfig | undefined {
  const { journeyName } = flowConfig;
  return journeyName ? journeySaveConfigs[journeyName] : undefined;
}

export function prepareDataForSave(
  sectionId: string,
  req: Request,
  ccdCase: PTCaseData | undefined,
  flowConfig: JourneyFlowConfig
): Record<string, unknown> {
  return getJourneySaveConfig(flowConfig)?.mapData(sectionId, req, ccdCase) ?? {};
}

export async function saveSection(
  caseReference: string,
  sectionId: string,
  req: Request,
  flowConfig: JourneyFlowConfig
): Promise<void> {
  const saveConfig = getJourneySaveConfig(flowConfig);
  if (!saveConfig) {
    return;
  }
  const data = saveConfig.mapData(sectionId, req, req.session.ccdCase);
  if (Object.keys(data).length === 0) {
    return;
  }
  const ccdCaseApi = getCaseApi(req.session.user);
  await ccdCaseApi.updateCase(caseReference, data, saveConfig.eventId);
}
