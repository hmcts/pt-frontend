import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/application-documents/your-tenancy-agreement/have-tenancy-agreement/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';

describe('application have-tenancy-agreement step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (
    formData: Record<string, unknown> = {},
    tenancyAgreementDetails?: Record<string, unknown>
  ): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: { formData: { [CASE_REF]: formData }, ccdCase: { tenancyAgreementDetails } },
    }) as unknown as Request;

  describe('isAnswered', () => {
    const isAnswered = (tenancyAgreementDetails?: Record<string, unknown>): boolean =>
      capturedConfig.isAnswered(makeReq({}, tenancyAgreementDetails));

    it('is not answered when nothing has been saved', () => {
      expect(isAnswered()).toBe(false);
      expect(isAnswered({})).toBe(false);
    });

    it('is answered when the citizen has a copy of the agreement', () => {
      expect(isAnswered({ copyOfTenancyAgreement: 'Yes' })).toBe(true);
    });

    it('is answered when the citizen has no copy and gave a reason', () => {
      expect(isAnswered({ copyOfTenancyAgreement: 'No', noTenancyAgreementReason: 'Never given one' })).toBe(true);
    });

    it('is not answered when the citizen has no copy and the reason is missing or too long', () => {
      expect(isAnswered({ copyOfTenancyAgreement: 'No' })).toBe(false);
      expect(isAnswered({ copyOfTenancyAgreement: 'No', noTenancyAgreementReason: 'a'.repeat(501) })).toBe(false);
    });
  });

  describe('reason validator', () => {
    const validate = (value: unknown): boolean | string =>
      capturedConfig.fields[0].options[1].subFields.noTenancyAgreementReason.validator(value);

    it('accepts a reason up to the maximum length', () => {
      expect(validate('a'.repeat(500))).toBe(true);
    });

    it('returns the invalid error key when the reason is too long', () => {
      expect(validate('a'.repeat(501))).toBe('errors.noTenancyAgreementReason.invalid');
    });
  });

  describe('getInitialFormData', () => {
    it('returns the answers from the form data', () => {
      const req = makeReq(
        {
          'have-tenancy-agreement': {
            copyOfTenancyAgreement: 'No',
            'copyOfTenancyAgreement.noTenancyAgreementReason': 'From the form',
          },
        },
        { copyOfTenancyAgreement: 'Yes', noTenancyAgreementReason: 'From the case' }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        copyOfTenancyAgreement: 'No',
        'copyOfTenancyAgreement.noTenancyAgreementReason': 'From the form',
      });
    });

    it('falls back to the saved case', () => {
      const req = makeReq({}, { copyOfTenancyAgreement: 'No', noTenancyAgreementReason: 'From the case' });

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        copyOfTenancyAgreement: 'No',
        'copyOfTenancyAgreement.noTenancyAgreementReason': 'From the case',
      });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(capturedConfig.getInitialFormData(makeReq())).toEqual({});
    });
  });
});
