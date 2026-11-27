import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import '../../../../main/steps/application/landlord-details/landlord-address/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

describe('application landlord-address step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (ccdCase?: Record<string, unknown>): Request => ({ session: { ccdCase } }) as unknown as Request;

  const requiredParts = {
    landlordAddressLine1: '1 High Street',
    landlordPostTown: 'Leeds',
    landlordCountry: 'United Kingdom',
  };

  // The same answers as pt-api returns them.
  const savedLandlord = { addressLine1: '1 High Street', postTown: 'Leeds', country: 'United Kingdom' };

  describe('isAnswered', () => {
    it('is not answered when nothing has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
      expect(capturedConfig.isAnswered(makeReq({}))).toBe(false);
    });

    it('is answered when the first line, town and postcode are saved', () => {
      expect(capturedConfig.isAnswered(makeReq({ landlordDetails: { landlord: savedLandlord } }))).toBe(true);
    });

    it.each(['addressLine1', 'postTown', 'country'])('is not answered when %s is missing', missing => {
      expect(
        capturedConfig.isAnswered(
          makeReq({ landlordDetails: { landlord: { ...savedLandlord, [missing]: undefined } } })
        )
      ).toBe(false);
    });
  });

  describe('validators', () => {
    const validatorFor = (name: string): ((value: unknown) => boolean | string) =>
      capturedConfig.fields.find((field: { name: string }) => field.name === name).validator;

    it.each([
      ['landlordAddressLine1', 'errors.landlordAddressLine1.tooShort'],
      ['landlordAddressLine2', 'errors.landlordAddressLine2.tooShort'],
      ['landlordPostTown', 'errors.landlordPostTown.tooShort'],
      ['landlordCounty', 'errors.landlordCounty.tooShort'],
      ['landlordCountry', 'errors.landlordCountry.tooShort'],
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
            landlordDetails: {
              landlord: { ...savedLandlord, addressLine2: 'Flat 2', county: 'West Yorkshire', postcode: 'LS1 1AA' },
            },
          },
        },
      };

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        ...requiredParts,
        landlordAddressLine2: 'Flat 2',
        landlordCounty: 'West Yorkshire',
        landlordPostcode: 'LS1 1AA',
      });
    });

    it('prefers saved form data over case values', () => {
      const req = {
        params: { caseReference: CASE_REF },
        session: {
          formData: {
            [CASE_REF]: {
              'landlord-address': {
                landlordAddressLine1: 'Amended Line 1',
                landlordPostTown: 'Amended Town',
                landlordCountry: 'Amended Country',
              },
            },
          },
          ccdCase: { landlordDetails: { landlord: savedLandlord } },
        },
      };

      expect(capturedConfig.getInitialFormData(req)).toEqual({
        landlordAddressLine1: 'Amended Line 1',
        landlordPostTown: 'Amended Town',
        landlordCountry: 'Amended Country',
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
