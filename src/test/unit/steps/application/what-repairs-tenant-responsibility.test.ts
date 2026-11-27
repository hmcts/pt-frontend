import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/the-property/what-repairs-tenant-responsibility/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const MAX_LENGTH = 500;

describe('application what-repairs-tenant-responsibility step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (propertyDetails?: Record<string, unknown>): Request =>
    ({ session: { ccdCase: { propertyDetails } } }) as unknown as Request;

  describe('isAnswered', () => {
    it('is not answered when nothing has been saved', () => {
      expect(capturedConfig.isAnswered({ session: {} } as unknown as Request)).toBe(false);
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
      expect(capturedConfig.isAnswered(makeReq({}))).toBe(false);
    });

    it('is answered when the citizen described the repairs', () => {
      expect(capturedConfig.isAnswered(makeReq({ tenantRepairsDetails: 'Decorating and the garden' }))).toBe(true);
    });

    it('is answered when the citizen left the optional answer blank', () => {
      expect(capturedConfig.isAnswered(makeReq({ tenantRepairsDetails: '' }))).toBe(true);
    });

    it('is not answered when the saved answer is longer than the limit', () => {
      expect(capturedConfig.isAnswered(makeReq({ tenantRepairsDetails: 'a'.repeat(MAX_LENGTH + 1) }))).toBe(false);
    });
  });

  describe('validator', () => {
    const validate = (value: unknown): boolean | string => capturedConfig.fields[0].validator(value);

    it('accepts an answer up to the limit', () => {
      expect(validate('a'.repeat(MAX_LENGTH))).toBe(true);
    });

    it('returns the error key when the answer is too long', () => {
      expect(validate('a'.repeat(MAX_LENGTH + 1))).toBe('errors.tenantRepairsDetails.invalid');
    });
  });

  describe('getInitialFormData', () => {
    const INITIAL_CASE_REF = '1234123412341234';
    const makeInitialReq = (
      stepFormData: Record<string, unknown> = {},
      propertyDetails?: Record<string, unknown>
    ): Request =>
      ({
        params: { caseReference: INITIAL_CASE_REF },
        session: {
          formData: { [INITIAL_CASE_REF]: { ['what-repairs-tenant-responsibility']: stepFormData } },
          ccdCase: propertyDetails ? { propertyDetails } : undefined,
        },
      }) as unknown as Request;
    const getInitialFormData = (req: Request) => capturedConfig.getInitialFormData(req);

    it('prefills the saved answer so the change link does not open a blank page', () => {
      expect(getInitialFormData(makeInitialReq({}, { tenantRepairsDetails: 'Saved tenantRepairsDetails' }))).toEqual({
        tenantRepairsDetails: 'Saved tenantRepairsDetails',
      });
    });

    it('prefers the answer in the session over the saved case', () => {
      const req = makeInitialReq(
        { tenantRepairsDetails: 'From session' },
        { tenantRepairsDetails: 'Saved tenantRepairsDetails' }
      );

      expect(getInitialFormData(req)).toMatchObject({ tenantRepairsDetails: 'From session' });
    });

    it('keeps a field the user cleared in the session blank', () => {
      const req = makeInitialReq({ tenantRepairsDetails: '' }, { tenantRepairsDetails: 'Saved tenantRepairsDetails' });

      expect(getInitialFormData(req)).toEqual({});
    });

    it('returns nothing when the question has not been answered', () => {
      expect(getInitialFormData(makeInitialReq())).toEqual({});
    });
  });
});
