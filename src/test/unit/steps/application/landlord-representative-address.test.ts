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

  // The same answers as pt-api returns them.
  const savedRepresentative = { addressLine1: '1 High Street', postTown: 'Leeds' };

  describe('isAnswered', () => {
    it('is not answered when nothing has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
      expect(capturedConfig.isAnswered(makeReq({}))).toBe(false);
    });

    it('is answered when the first line, town and postcode are saved', () => {
      expect(capturedConfig.isAnswered(makeReq({ landlordDetails: { representative: savedRepresentative } }))).toBe(
        true
      );
    });

    it.each(['addressLine1', 'postTown'])('is not answered when %s is missing', missing => {
      expect(
        capturedConfig.isAnswered(
          makeReq({ landlordDetails: { representative: { ...savedRepresentative, [missing]: undefined } } })
        )
      ).toBe(false);
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

    describe('representativePostcode', () => {
      it.each(['LS1 1AA', 'ls11aa', 'M1 1AE', 'B33 8TH', 'W1A 1HQ', ' LS1 1AA '])(
        'accepts the postcode %p',
        postcode => {
          expect(validatorFor('representativePostcode')(postcode)).toBe(true);
        }
      );

      it.each([undefined, null, ''])('accepts a blank postcode (%p) because it is optional', value => {
        expect(validatorFor('representativePostcode')(value)).toBe(true);
      });

      it.each(['LS1', '12345', 'not a postcode', 'LS1 1A', 'LS11 1AAA'])(
        'rejects the invalid postcode %p',
        postcode => {
          expect(validatorFor('representativePostcode')(postcode)).toBe('errors.postcode.invalid');
        }
      );
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
            landlordDetails: {
              representative: {
                ...savedRepresentative,
                addressLine2: 'Flat 2',
                county: 'West Yorkshire',
                postcode: 'LS1 1AA',
              },
            },
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
          ccdCase: { landlordDetails: { representative: savedRepresentative } },
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
