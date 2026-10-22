import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/inspection-and-hearing/hearing/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';
const REASON_KEY = 'agreeToDecisionWithoutHearing.noDecisionWithoutHearingReason';

describe('application hearing step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (
    formData: Record<string, unknown> = {},
    hearingInspectionDetails?: Record<string, unknown>
  ): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: formData }, ccdCase: { hearingInspectionDetails } },
    }) as unknown as Request;

  describe('isAnswered', () => {
    it('is not answered when nothing has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
    });

    it('is answered when no hearing was requested', () => {
      expect(capturedConfig.isAnswered(makeReq({}, { hearingRequested: 'No' }))).toBe(true);
    });

    it('is answered when a hearing was requested with a reason', () => {
      const req = makeReq({}, { hearingRequested: 'Yes', reasonHearingRequested: 'I want to attend' });

      expect(capturedConfig.isAnswered(req)).toBe(true);
    });

    it('is not answered when a hearing was requested with no reason', () => {
      expect(capturedConfig.isAnswered(makeReq({}, { hearingRequested: 'Yes' }))).toBe(false);
    });
  });

  it('checks the reason length with the shared helper', () => {
    const validator = capturedConfig.fields[0].options[1].subFields.noDecisionWithoutHearingReason.validator;

    expect(validator('a'.repeat(500))).toBe(true);
    expect(validator('a'.repeat(501))).toBe('errors.noDecisionWithoutHearingReason.invalid');
  });

  describe('getInitialFormData', () => {
    it('returns the answers from the form data', () => {
      const req = makeReq({ hearing: { agreeToDecisionWithoutHearing: 'No', [REASON_KEY]: 'From the form' } });

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        agreeToDecisionWithoutHearing: 'No',
        [REASON_KEY]: 'From the form',
      });
    });

    it('flips the saved hearingRequested back to the answer the citizen gave', () => {
      const req = makeReq({}, { hearingRequested: 'Yes', reasonHearingRequested: 'Saved' });

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        agreeToDecisionWithoutHearing: 'No',
        [REASON_KEY]: 'Saved',
      });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(capturedConfig.getInitialFormData(makeReq())).toEqual({});
    });
  });
});
