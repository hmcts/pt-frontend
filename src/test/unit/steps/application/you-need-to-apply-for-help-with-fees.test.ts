import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/review-submit-and-pay/tell-us-if-you-need-help/you-need-to-apply-for-help-with-fees/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';
const STEP_NAME = 'you-need-to-apply-for-help-with-fees';

describe('application you-need-to-apply-for-help-with-fees step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (stepData: Record<string, unknown> = {}, ccdCase?: Record<string, unknown>): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: { [STEP_NAME]: stepData } }, ccdCase },
    }) as unknown as Request;

  describe('isAnswered', () => {
    it('is not answered when no reference number has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
      expect(capturedConfig.isAnswered(makeReq({}, {}))).toBe(false);
    });

    it('is answered when a valid reference number has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq({}, { referenceNumber: 'HWF-A1B-23C' }))).toBe(true);
    });

    it('is not answered when the saved reference number is not in the HWF format', () => {
      expect(capturedConfig.isAnswered(makeReq({}, { referenceNumber: 'HWF-123' }))).toBe(false);
    });
  });

  describe('beforeRedirect', () => {
    it('stores the reference number in upper case without surrounding spaces', () => {
      const req = makeReq({ referenceNumber: ' hwf-a1b-23c ' });

      capturedConfig.beforeRedirect(req);

      expect(req.session.formData![CASE_REF][STEP_NAME]).toEqual({ referenceNumber: 'HWF-A1B-23C' });
    });

    it('leaves an empty reference number alone', () => {
      const req = makeReq({ referenceNumber: '' });

      capturedConfig.beforeRedirect(req);

      expect(req.session.formData![CASE_REF][STEP_NAME]).toEqual({ referenceNumber: '' });
    });
  });

  describe('reference number validator', () => {
    const validate = (value: unknown): boolean | string => capturedConfig.fields[0].validator(value);

    it('leaves an empty value to the required check', () => {
      expect(validate('')).toBe(true);
    });

    it('accepts a reference number in the HWF format', () => {
      expect(validate('HWF-A1B-23C')).toBe(true);
    });

    it('returns the invalid error key when the reference number is not in the HWF format', () => {
      expect(validate('HWF-123')).toBe('errors.referenceNumber.invalid');
    });
  });
});
