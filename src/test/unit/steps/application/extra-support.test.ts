import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/support-for-health-conditions/extra-support/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';

describe('extra support step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (formData: Record<string, unknown> = {}, extraSupportRequired?: Record<string, unknown>): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: formData }, ccdCase: { extraSupportDetails: extraSupportRequired } },
    }) as unknown as Request;

  describe('isAnswered', () => {
    const isAnswered = (extraSupportRequired?: Record<string, unknown>): boolean =>
      capturedConfig.isAnswered(makeReq({}, extraSupportRequired));

    it('is not answered when nothing has been saved', () => {
      expect(isAnswered()).toBe(false);
      expect(isAnswered({})).toBe(false);
    });

    it('is answered when the citizen selects No to extra support', () => {
      expect(isAnswered({ extraSupportRequired: 'NO' })).toBe(true);
    });

    it('is not answered when the citizen selects Yes but has not provided details', () => {
      expect(isAnswered({ extraSupportRequired: 'YES' })).toBe(false);
    });

    it('is answered when the citizen selects Yes and provides details', () => {
      expect(
        isAnswered({
          extraSupportRequired: 'YES',
          extraSupportRequiredDetails: 'Communication difficulties',
        })
      ).toBe(true);
    });
  });

  describe('getInitialFormData', () => {
    it('returns the answers from the form data', () => {
      const req = makeReq({
        'extra-support': { extraSupport: 'Yes', 'extraSupport.extraSupportDetails': 'Communication difficulties' },
      });

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        extraSupport: 'Yes',
        extraSupportDetails: 'Communication difficulties',
      });
    });

    it('falls back to the saved case', () => {
      const req = makeReq(
        {},
        { extraSupportRequired: 'Yes', extraSupportRequiredDetails: 'Communication difficulties' }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        extraSupport: 'Yes',
        extraSupportDetails: 'Communication difficulties',
      });
    });

    it('prefers form data over the saved case', () => {
      const req = makeReq(
        {
          'extra-support': {
            extraSupport: 'Yes',
            'extraSupport.extraSupportDetails': 'Updated communication requirements',
          },
        },
        {
          extraSupportRequired: 'Yes',
          extraSupportRequiredDetails: 'Previously saved details',
        }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        extraSupport: 'Yes',
        extraSupportDetails: 'Updated communication requirements',
      });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(capturedConfig.getInitialFormData(makeReq())).toEqual({});
    });
  });
});
