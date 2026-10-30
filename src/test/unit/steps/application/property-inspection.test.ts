import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/inspection-and-hearing/property-inspection/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';
const REASON_KEY = 'agreeToDecisionWithoutInspection.noDecisionWithoutInspectionReason';

describe('application property-inspection step', () => {
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

    it('is answered when the citizen agreed', () => {
      expect(capturedConfig.isAnswered(makeReq({}, { agreeToDecisionWithoutInspection: 'Yes' }))).toBe(true);
    });

    it('is answered when the citizen did not agree and gave a reason', () => {
      const req = makeReq({}, { agreeToDecisionWithoutInspection: 'No', noDecisionWithoutInspectionReason: 'Damp' });

      expect(capturedConfig.isAnswered(req)).toBe(true);
    });

    it('is not answered when the citizen did not agree and gave no reason', () => {
      expect(capturedConfig.isAnswered(makeReq({}, { agreeToDecisionWithoutInspection: 'No' }))).toBe(false);
    });
  });

  it('checks the reason length with the shared helper', () => {
    const validator = capturedConfig.fields[0].options[1].subFields.noDecisionWithoutInspectionReason.validator;

    expect(validator('a'.repeat(500))).toBe(true);
    expect(validator('a'.repeat(501))).toBe('errors.noDecisionWithoutInspectionReason.invalid');
  });

  describe('getInitialFormData', () => {
    it('returns the answers from the form data', () => {
      const req = makeReq({
        'property-inspection': { agreeToDecisionWithoutInspection: 'No', [REASON_KEY]: 'From the form' },
      });

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        agreeToDecisionWithoutInspection: 'No',
        [REASON_KEY]: 'From the form',
      });
    });

    it('falls back to the saved case', () => {
      const req = makeReq({}, { agreeToDecisionWithoutInspection: 'No', noDecisionWithoutInspectionReason: 'Saved' });

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        agreeToDecisionWithoutInspection: 'No',
        [REASON_KEY]: 'Saved',
      });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(capturedConfig.getInitialFormData(makeReq())).toEqual({});
    });
  });
});
