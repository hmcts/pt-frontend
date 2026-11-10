import { Request } from 'express';

import { prepareDataForSave } from '../../../../main/steps/utils/dataMapping';

import type { JourneyFlowConfig } from '@modules/steps/stepFlow.interface';
import { PTCaseData } from '@services/ccd/ccdCase.interface';

const CASE_REF = '1234123412341234';
const applicationFlowConfig: JourneyFlowConfig = { journeyName: 'application', steps: {} };

describe('journey selection', () => {
  const mockReq = {
    params: { caseReference: CASE_REF },
    session: { formData: { [CASE_REF]: { 'text-updates': { textUpdates: 'Yes' } } } },
  } as unknown as Request;
  const ccdCaseData = {} as unknown as PTCaseData;

  it('uses the application mapping for the application journey', () => {
    expect(prepareDataForSave('contactPreferences', mockReq, ccdCaseData, applicationFlowConfig)).toEqual(
      expect.objectContaining({ applicantContactPreferences: expect.any(Object) })
    );
  });

  it('returns nothing to save for a journey with no mapping', () => {
    const flow: JourneyFlowConfig = { journeyName: 'unknownJourney', steps: {} };

    expect(prepareDataForSave('contactPreferences', mockReq, ccdCaseData, flow)).toEqual({});
  });

  it('returns nothing to save when the flow has no journey name', () => {
    expect(prepareDataForSave('contactPreferences', mockReq, ccdCaseData, { steps: {} })).toEqual({});
  });

  it('does not use the application mapping for landlord response', () => {
    const flow: JourneyFlowConfig = { journeyName: 'landlordResponse', steps: {} };

    expect(prepareDataForSave('contactPreferences', mockReq, ccdCaseData, flow)).toEqual({});
  });
});
