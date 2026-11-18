import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/the-property/property-address/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

describe('application property-address step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (propertyDetails?: Record<string, unknown>): Request =>
    ({
      session: {
        ccdCase: propertyDetails ? { propertyDetails } : undefined,
      },
    }) as unknown as Request;

  const requiredParts = { addressLine1: '1 High Street', postTown: 'Leeds', postcode: 'LS1 1AA' };

  describe('isAnswered', () => {
    it('is not answered when nothing has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
      expect(capturedConfig.isAnswered(makeReq({}))).toBe(false);
    });

    it('is answered when the first line, town and postcode are saved', () => {
      expect(capturedConfig.isAnswered(makeReq(requiredParts))).toBe(true);
    });

    it.each(['addressLine1', 'postTown', 'postcode'])('is not answered when %s is missing', missing => {
      expect(capturedConfig.isAnswered(makeReq({ ...requiredParts, [missing]: undefined }))).toBe(false);
    });
  });

  describe('validators', () => {
    const validatorFor = (name: string): ((value: unknown) => boolean | string) =>
      capturedConfig.fields.find((field: { name: string }) => field.name === name).validator;

    it.each([
      ['addressLine1', 'errors.addressLine1.invalid'],
      ['addressLine2', 'errors.addressLine2.invalid'],
      ['postTown', 'errors.postTown.invalid'],
      ['county', 'errors.county.invalid'],
    ])('rejects a one character %s', (name, errorKey) => {
      expect(validatorFor(name)('ab')).toBe(true);
      expect(validatorFor(name)('a')).toBe(errorKey);
    });

    it('accepts a valid postcode and returns the error key for an invalid one', () => {
      expect(validatorFor('postcode')('LS1 1AA')).toBe(true);
      expect(validatorFor('postcode')('not a postcode')).toBe('errors.postcode.invalid');
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
          formData: { [INITIAL_CASE_REF]: { ['property-address']: stepFormData } },
          ccdCase: propertyDetails ? { propertyDetails } : undefined,
        },
      }) as unknown as Request;
    const getInitialFormData = (req: Request) => capturedConfig.getInitialFormData(req);

    it('prefills the saved answer so the change link does not open a blank page', () => {
      expect(
        getInitialFormData(
          makeInitialReq(
            {},
            {
              addressLine1: 'Saved addressLine1',
              addressLine2: 'Saved addressLine2',
              postTown: 'Saved postTown',
              county: 'Saved county',
              postcode: 'Saved postcode',
            }
          )
        )
      ).toEqual({
        addressLine1: 'Saved addressLine1',
        addressLine2: 'Saved addressLine2',
        postTown: 'Saved postTown',
        county: 'Saved county',
        postcode: 'Saved postcode',
      });
    });

    it('prefers the answer in the session over the saved case', () => {
      const req = makeInitialReq({ addressLine1: 'From session' }, { addressLine1: 'Saved addressLine1' });

      expect(getInitialFormData(req)).toMatchObject({ addressLine1: 'From session' });
    });

    it('keeps a field the user cleared in the session blank', () => {
      const req = makeInitialReq({ addressLine1: '' }, { addressLine1: 'Saved addressLine1' });

      expect(getInitialFormData(req)).toEqual({});
    });

    it('returns nothing when the question has not been answered', () => {
      expect(getInitialFormData(makeInitialReq())).toEqual({});
    });
  });
});
