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

  const makeReq = (ccdCase?: Record<string, unknown>): Request => ({ session: { ccdCase } }) as unknown as Request;

  describe('isAnswered', () => {
    it('is not answered when there is no case', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
    });

    it('is not answered when no property type has been saved', () => {
      expect(capturedConfig.isAnswered(makeReq({}))).toBe(false);
    });

    it.each(['terraced', 'semiDetached', 'detached'])('is answered for a %s house', propertyType => {
      expect(capturedConfig.isAnswered(makeReq({ propertyType }))).toBe(true);
    });

    it('is answered for rooms with or without the optional description', () => {
      expect(capturedConfig.isAnswered(makeReq({ propertyType: 'roomOrRooms' }))).toBe(true);
      expect(
        capturedConfig.isAnswered(makeReq({ propertyType: 'roomOrRooms', propertyTypeRoomDescription: 'Two rooms' }))
      ).toBe(true);
    });

    it('is not answered for rooms when the saved description is longer than the limit', () => {
      const req = makeReq({ propertyType: 'roomOrRooms', propertyTypeRoomDescription: 'a'.repeat(MAX_LENGTH + 1) });

      expect(capturedConfig.isAnswered(req)).toBe(false);
    });

    it('is answered for a flat with or without the optional floor', () => {
      expect(capturedConfig.isAnswered(makeReq({ propertyType: 'flat' }))).toBe(true);
      expect(capturedConfig.isAnswered(makeReq({ propertyType: 'flat', propertyTypeFlatFloor: '3' }))).toBe(true);
    });

    it('is not answered for a flat when the saved floor is longer than the limit', () => {
      const req = makeReq({ propertyType: 'flat', propertyTypeFlatFloor: 'a'.repeat(MAX_LENGTH + 1) });

      expect(capturedConfig.isAnswered(req)).toBe(false);
    });

    it('is answered for another type only when the citizen described it', () => {
      expect(
        capturedConfig.isAnswered(makeReq({ propertyType: 'other', propertyTypeOtherDescription: 'A houseboat' }))
      ).toBe(true);
      expect(capturedConfig.isAnswered(makeReq({ propertyType: 'other' }))).toBe(false);
    });
  });

  describe('validators', () => {
    const subField = (optionValue: string, key: string): { validator: (value: unknown) => boolean | string } =>
      capturedConfig.fields[0].options.find((option: { value: string }) => option.value === optionValue).subFields[key];

    it.each([
      ['roomOrRooms', 'roomOrRoomsDescription', 'errors.roomOrRoomsDescription.invalid'],
      ['flat', 'flatFloor', 'errors.flatFloor.invalid'],
      ['other', 'otherDescription', 'errors.otherDescription.invalid'],
    ])('limits the %s detail to the maximum length', (optionValue, key, errorKey) => {
      const { validator } = subField(optionValue, key);

      expect(validator('a'.repeat(MAX_LENGTH))).toBe(true);
      expect(validator('a'.repeat(MAX_LENGTH + 1))).toBe(errorKey);
    });
  });
});
