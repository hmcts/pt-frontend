import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import '../../../../main/steps/application/landlord-details/landlord-representative-address/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

describe('application landlord-representative-address step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (ccdCase?: Record<string, unknown>): Request => ({ session: { ccdCase } }) as unknown as Request;

  const requiredParts = {
    representativeAddressLine1: '1 High Street',
    representativePostTown: 'Leeds',
  };

  describe('isAnswered', () => {
    it('is not answered when nothing has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
      expect(capturedConfig.isAnswered(makeReq({}))).toBe(false);
    });

    it('is answered when the first line, town and postcode are saved', () => {
      expect(capturedConfig.isAnswered(makeReq(requiredParts))).toBe(true);
    });

    it.each(['representativeAddressLine1', 'representativePostTown'])('is not answered when %s is missing', missing => {
      expect(capturedConfig.isAnswered(makeReq({ ...requiredParts, [missing]: undefined }))).toBe(false);
    });
  });

  describe('validators', () => {
    const validatorFor = (name: string): ((value: unknown) => boolean | string) =>
      capturedConfig.fields.find((field: { name: string }) => field.name === name).validator;

    it.each([
      ['representativeAddressLine1', 'errors.representativeAddressLine1.tooShort'],
      ['representativeAddressLine2', 'errors.representativeAddressLine2.tooShort'],
      ['representativePostTown', 'errors.representativePostTown.tooShort'],
      ['representativeCounty', 'errors.representativeCounty.tooShort'],
    ])('rejects a one character %s', (name, errorKey) => {
      expect(validatorFor(name)('ab')).toBe(true);
      expect(validatorFor(name)('a')).toBe(errorKey);
    });
  });

  describe('getIntialFormData', () => {
    const CASE_REF = '1234123412341234';

    it('pre-populates fields from the case', () => {
      const req = {
        params: { caseReference: CASE_REF },
        session: {
          formData: {},
          ccdCase: {
            ...requiredParts,
            representativeAddressLine2: 'Flat 2',
            representativeCounty: 'West Yorkshire',
            representativePostcode: 'LS1 1AA',
          },
        },
      };

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        ...requiredParts,
        representativeAddressLine2: 'Flat 2',
        representativeCounty: 'West Yorkshire',
        representativePostcode: 'LS1 1AA',
      });
    });

    it('prefers saved form data over case values', () => {
      const req = {
        params: { caseReference: CASE_REF },
        session: {
          formData: {
            [CASE_REF]: {
              'landlord-representative-address': {
                representativeAddressLine1: 'Amended Line 1',
                representativePostTown: 'Amended Town',
              },
            },
          },
          ccdCase: requiredParts,
        },
      };

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        representativeAddressLine1: 'Amended Line 1',
        representativePostTown: 'Amended Town',
      });
    });

    it('returns and empty object when nothing is saved', () => {
      const req = {
        params: { caseReference: CASE_REF },
        session: { formData: {}, ccdCase: {} },
      };

      expect(capturedConfig.getInitialFormData(req)).toEqual({});
    });
  });
});
