import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/application-documents/landlords-notice/have-landlords-notice/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';

describe('application have-landlords-notice step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (
    formData: Record<string, unknown> = {},
    receivedLandlordNoticeProposingNewRent?: Record<string, unknown>
  ): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: {
        formData: { [CASE_REF]: formData },
        ccdCase: { noticeOfRentIncreaseDetails: receivedLandlordNoticeProposingNewRent },
      },
    }) as unknown as Request;

  describe('isAnswered', () => {
    const isAnswered = (receivedLandlordNoticeProposingNewRent?: Record<string, unknown>): boolean =>
      capturedConfig.isAnswered(makeReq({}, receivedLandlordNoticeProposingNewRent));

    it('is not answered when nothing has been saved', () => {
      expect(isAnswered()).toBe(false);
      expect(isAnswered({})).toBe(false);
    });

    it('is answered when the citizen has a copy of the agreement', () => {
      expect(isAnswered({ receivedLandlordNoticeProposingNewRent: 'Yes' })).toBe(true);
    });

    it('is answered when the citizen has no copy and gave a reason', () => {
      expect(
        isAnswered({
          receivedLandlordNoticeProposingNewRent: 'No',
          noUploadOfNoticeProposingNewRentReason: 'Never given one',
        })
      ).toBe(true);
    });

    it('is not answered when the citizen has no copy and the reason is missing or too long/short', () => {
      expect(isAnswered({ receivedLandlordNoticeProposingNewRent: 'No' })).toBe(false);
      expect(
        isAnswered({
          receivedLandlordNoticeProposingNewRent: 'No',
          noUploadOfNoticeProposingNewRentReason: 'a'.repeat(501),
        })
      ).toBe(false);
      expect(
        isAnswered({
          receivedLandlordNoticeProposingNewRent: 'No',
          noUploadOfNoticeProposingNewRentReason: 'a'.repeat(1),
        })
      ).toBe(false);
    });
  });

  describe('reason validator', () => {
    const validate = (value: unknown): boolean | string =>
      capturedConfig.fields[0].options[1].subFields.noLandlordsNoticeReason.validator(value);

    it('accepts a reason up to the maximum length', () => {
      expect(validate('a'.repeat(500))).toBe(true);
    });

    it('returns the invalid error key when the reason is too long', () => {
      expect(validate('a'.repeat(501))).toBe('errors.noLandlordsNoticeReason.invalidMaxLength');
    });

    it('returns the invalid error key when the reason is too short', () => {
      expect(validate('a'.repeat(1))).toBe('errors.noLandlordsNoticeReason.invalidMinLength');
    });
  });

  describe('getInitialFormData', () => {
    it('returns the answers from the form data', () => {
      const req = makeReq(
        {
          'have-landlords-notice': {
            haveLandlordsNotice: 'No',
            'haveLandlordsNotice.noLandlordsNoticeReason': 'From the form',
          },
        },
        { receivedLandlordNoticeProposingNewRent: 'Yes', noUploadOfNoticeProposingNewRentReason: 'From the case' }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        haveLandlordsNotice: 'No',
        'haveLandlordsNotice.noLandlordsNoticeReason': 'From the form',
      });
    });

    it('falls back to the saved case', () => {
      const req = makeReq(
        {},
        { receivedLandlordNoticeProposingNewRent: 'No', noUploadOfNoticeProposingNewRentReason: 'From the case' }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        haveLandlordsNotice: 'No',
        'haveLandlordsNotice.noLandlordsNoticeReason': 'From the case',
      });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(capturedConfig.getInitialFormData(makeReq())).toEqual({});
    });
  });
});
