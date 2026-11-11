import type { Request } from 'express';

import { prepareLandlordResponseDataForSave } from '../../../../main/steps/landlord-response/dataMapping';
import { saveSection } from '../../../../main/steps/utils/dataMapping';

import type { JourneyFlowConfig } from '@modules/steps/stepFlow.interface';
import { getCaseApi } from '@services/ccd/ccdApiClient';
import { CITIZEN_UPDATE_CASE, RESPONDENT_UPDATE_RESPONSE } from '@services/ccd/ccdCase.interface';

jest.mock('@services/ccd/ccdApiClient', () => ({ getCaseApi: jest.fn() }));
jest.mock('../../../../main/steps/landlord-response/dataMapping', () => ({
  prepareLandlordResponseDataForSave: jest.fn(),
}));

const CASE_REF = '1234123412341234';
const USER = { accessToken: 'token' };

const flow = (journeyName?: string): JourneyFlowConfig => ({ journeyName, steps: {} });

const makeReq = (formData: Record<string, unknown> = {}, ccdCase?: unknown): Request =>
  ({
    params: { caseReference: CASE_REF },
    session: { user: USER, ccdCase, formData: { [CASE_REF]: formData } },
  }) as unknown as Request;

describe('saveSection', () => {
  const updateCase = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getCaseApi as jest.Mock).mockReturnValue({ updateCase });
    updateCase.mockResolvedValue({});
    (prepareLandlordResponseDataForSave as jest.Mock).mockReturnValue({});
  });

  it('saves application answers with the citizen update event', async () => {
    const req = makeReq({ 'contact-by-phone': { phoneNumberForCalls: '07123456789' } });

    await saveSection(CASE_REF, 'contactPreferences', req, flow('application'));

    expect(getCaseApi).toHaveBeenCalledWith(USER);
    expect(updateCase).toHaveBeenCalledWith(
      CASE_REF,
      {
        applicantContactPreferences: {
          phoneNumberForCalls: '07123456789',
          textUpdates: undefined,
          textUpdatesPhoneNumber: undefined,
        },
      },
      CITIZEN_UPDATE_CASE
    );
  });

  it('saves landlord response answers with the respondent update event', async () => {
    const ccdCase = { caseReference: CASE_REF };
    const req = makeReq({}, ccdCase);
    (prepareLandlordResponseDataForSave as jest.Mock).mockReturnValue({ someAnswer: 'Yes' });

    await saveSection(CASE_REF, 'yourResponse', req, flow('landlordResponse'));

    expect(prepareLandlordResponseDataForSave).toHaveBeenCalledWith('yourResponse', req, ccdCase);
    expect(updateCase).toHaveBeenCalledWith(CASE_REF, { someAnswer: 'Yes' }, RESPONDENT_UPDATE_RESPONSE);
  });

  it('does not use the application mapping for landlord response', async () => {
    const req = makeReq({ 'contact-by-phone': { phoneNumberForCalls: '07123456789' } });

    await saveSection(CASE_REF, 'contactPreferences', req, flow('landlordResponse'));

    expect(prepareLandlordResponseDataForSave).toHaveBeenCalledWith('contactPreferences', req, undefined);
    expect(getCaseApi).not.toHaveBeenCalled();
  });

  it('does not call CCD when the section has nothing to save', async () => {
    await saveSection(CASE_REF, 'landlordDetails', makeReq(), flow('application'));

    expect(getCaseApi).not.toHaveBeenCalled();
  });

  it.each([
    ['an unknown journey', 'unknownJourney'],
    ['no journey name', undefined],
  ])('does not call CCD for %s', async (_label, journeyName) => {
    const req = makeReq({ 'contact-by-phone': { phoneNumberForCalls: '07123456789' } });

    await saveSection(CASE_REF, 'contactPreferences', req, flow(journeyName));

    expect(getCaseApi).not.toHaveBeenCalled();
  });

  it('passes a failed save back to the caller', async () => {
    const error = new Error('CCD unavailable');
    updateCase.mockRejectedValue(error);
    const req = makeReq({ 'contact-by-phone': { phoneNumberForCalls: '07123456789' } });

    await expect(saveSection(CASE_REF, 'contactPreferences', req, flow('application'))).rejects.toBe(error);
  });
});
