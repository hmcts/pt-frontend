import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import '../../../../main/steps/application/the-rent/the-current-rent-and-other-costs/other-household-management-charges-details';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';

describe('application other-household-management-charges-details step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (formData: Record<string, unknown> = {}, currentRentsDetails?: Record<string, unknown>): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: formData }, ccdCase: { currentRentsDetails } },
    }) as unknown as Request;

  describe('isAnswered', () => {
    const isAnswered = (currentRentsDetails?: Record<string, unknown>): boolean =>
      capturedConfig.isAnswered(makeReq({}, currentRentsDetails));

    it('is not answered when no details have been saved', () => {
      expect(isAnswered()).toBe(false);
    });

    it('is answered when details have been saved', () => {
      expect(isAnswered({ otherHouseholdManagementChargesDetails: 'Cleaning of shared areas' })).toBe(true);
    });

    it.each(['', null])('is answered when the optional details were saved blank as %p', details => {
      expect(isAnswered({ otherHouseholdManagementChargesDetails: details })).toBe(true);
    });

    it('is not answered when the saved details are too long', () => {
      expect(isAnswered({ otherHouseholdManagementChargesDetails: 'a'.repeat(501) })).toBe(false);
    });
  });

  describe('validator', () => {
    const validate = (value: unknown): boolean | string => capturedConfig.fields[0].validator(value);

    it('accepts details within the length limit', () => {
      expect(validate('Cleaning of shared areas')).toBe(true);
    });

    it('returns the invalid error key when the details are too long', () => {
      expect(validate('a'.repeat(501))).toBe('errors.otherHouseholdManagementChargesDetails.invalid');
    });
  });

  describe('getInitialFormData', () => {
    it('prefers the details entered this session over the saved details', () => {
      const req = makeReq(
        {
          'other-household-management-charges-details': {
            otherHouseholdManagementChargesDetails: 'Typed this session',
          },
        },
        { otherHouseholdManagementChargesDetails: 'Saved details' }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        otherHouseholdManagementChargesDetails: 'Typed this session',
      });
    });

    it('falls back to the saved case', () => {
      const req = makeReq({}, { otherHouseholdManagementChargesDetails: 'Saved details' });

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        otherHouseholdManagementChargesDetails: 'Saved details',
      });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(capturedConfig.getInitialFormData(makeReq())).toEqual({});
    });
  });
});
