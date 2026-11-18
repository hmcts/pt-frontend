import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/the-property/what-are-you-renting/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const MAX_LENGTH = 500;

describe('application what-are-you-renting step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const CASE_REF = '1234123412341234';
  const makeReq = (propertyDetails?: Record<string, unknown>): Request => {
    const req = {
      params: { caseReference: CASE_REF },
      session: {
        ccdCase: propertyDetails
          ? {
              caseReference: CASE_REF,
              propertyDetails,
            }
          : undefined,
      },
    };
    return req as unknown as Request;
  };

  describe('isAnswered', () => {
    it('is not answered when there is no case', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
    });

    it('is not answered when no property type has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq({}))).toBe(false);
    });

    it.each(['terracedHouse', 'semiDetachedHouse', 'fullyDetachedHouse'])(
      'is answered for a %s house',
      propertyType => {
        expect(capturedConfig.isAnswered(makeReq({ propertyType }))).toBe(true);
      }
    );

    it('is answered for rooms with or without the optional description', () => {
      expect(capturedConfig.isAnswered(makeReq({ propertyType: 'room' }))).toBe(true);
      expect(capturedConfig.isAnswered(makeReq({ propertyType: 'room', rentingRoomDetails: 'Two rooms' }))).toBe(true);
    });

    it('is not answered for rooms when the saved description is longer than the limit', () => {
      const req = makeReq({ propertyType: 'room', rentingRoomDetails: 'a'.repeat(MAX_LENGTH + 1) });

      expect(capturedConfig.isAnswered(req)).toBe(false);
    });

    it('is answered for a flat with or without the optional floor', () => {
      expect(capturedConfig.isAnswered(makeReq({ propertyType: 'flat' }))).toBe(true);
      expect(capturedConfig.isAnswered(makeReq({ propertyType: 'flat', rentingFlatDetails: '3' }))).toBe(true);
    });

    it('is not answered for a flat when the saved floor is longer than the limit', () => {
      const req = makeReq({ propertyType: 'flat', rentingFlatDetails: 'a'.repeat(MAX_LENGTH + 1) });

      expect(capturedConfig.isAnswered(req)).toBe(false);
    });

    it('is answered for another type only when the citizen described it', () => {
      expect(
        capturedConfig.isAnswered(makeReq({ propertyType: 'other', otherMethodRentingDetails: 'A houseboat' }))
      ).toBe(true);
      expect(capturedConfig.isAnswered(makeReq({ propertyType: 'other' }))).toBe(false);
    });
  });

  describe('validators', () => {
    const subField = (optionValue: string, key: string): { validator: (value: unknown) => boolean | string } =>
      capturedConfig.fields[0].options.find((option: { value: string }) => option.value === optionValue).subFields[key];

    it.each([
      ['room', 'roomDescription', 'errors.roomDescription.invalid'],
      ['flat', 'flatFloor', 'errors.flatFloor.invalid'],
      ['other', 'otherDescription', 'errors.otherDescription.invalid'],
    ])('limits the %s detail to the maximum length', (optionValue, key, errorKey) => {
      const { validator } = subField(optionValue, key);

      expect(validator('a'.repeat(MAX_LENGTH))).toBe(true);
      expect(validator('a'.repeat(MAX_LENGTH + 1))).toBe(errorKey);
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
          formData: { [INITIAL_CASE_REF]: { ['what-are-you-renting']: stepFormData } },
          ccdCase: propertyDetails ? { propertyDetails } : undefined,
        },
      }) as unknown as Request;
    const getInitialFormData = (req: Request) => capturedConfig.getInitialFormData(req);

    it('prefills the saved answer and details so the change link does not open a blank page', () => {
      expect(
        getInitialFormData(makeInitialReq({}, { propertyType: 'flat', rentingFlatDetails: 'Second floor' }))
      ).toEqual({
        propertyType: 'flat',
        'propertyType.flatFloor': 'Second floor',
      });
    });

    it('prefers the answer in the session over the saved case', () => {
      const req = makeInitialReq(
        { propertyType: 'flat', 'propertyType.flatFloor': 'Changed in session' },
        { propertyType: 'flat', rentingFlatDetails: 'Second floor' }
      );

      expect(getInitialFormData(req)).toEqual({ propertyType: 'flat', 'propertyType.flatFloor': 'Changed in session' });
    });

    it('does not bring back the saved details once the answer has changed', () => {
      const req = makeInitialReq(
        { propertyType: 'terracedHouse' },
        { propertyType: 'flat', rentingFlatDetails: 'Second floor' }
      );

      expect(getInitialFormData(req)).toEqual({ propertyType: 'terracedHouse' });
    });

    it.each([
      ['room', 'roomDescription', 'rentingRoomDetails'],
      ['other', 'otherDescription', 'otherMethodRentingDetails'],
    ])('prefills the %s description under the right reveal', (propertyType, subFieldKey, savedField) => {
      expect(getInitialFormData(makeInitialReq({}, { propertyType, [savedField]: 'Described' }))).toEqual({
        propertyType,
        [`propertyType.${subFieldKey}`]: 'Described',
      });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(getInitialFormData(makeInitialReq())).toEqual({});
    });
  });
});
