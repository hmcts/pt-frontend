import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import './../../../../main/steps/application/the-rent/what-you-think-market-rent-should-be/anything-else-tribunal-should-consider/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';
const STEP_NAME = 'anything-else-tribunal-should-consider';
const FIELD = 'additionalInfoToConsiderWhenDeterminingRent';
const DETAILS = 'additionalInfoToConsiderWhenDeterminingRentDetails';
const DETAILS_KEY = `${FIELD}.${DETAILS}`;
const MAX_LENGTH = 500;

describe('application anything-else-tribunal-should-consider step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls[0][0];

  const makeReq = (stepData?: Record<string, unknown>, marketRentDetails?: Record<string, unknown>): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: {
        formData: { [CASE_REF]: stepData ? { [STEP_NAME]: stepData } : {} },
        ccdCase: { marketRentDetails },
      },
    }) as unknown as Request;

  describe('isAnswered', () => {
    it('is not answered when the question has not been visited', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
    });

    it('is answered when the citizen said yes and gave details', () => {
      const req = makeReq(undefined, {
        additionalPropertyInfoToConsiderWhenDetermining: 'Yes',
        additionalPropertyInfoToConsiderWhenDeterminingDetails: 'Near a busy road',
      });

      expect(capturedConfig.isAnswered(req)).toBe(true);
    });

    it('is not answered when the citizen said yes without giving details', () => {
      const req = makeReq(undefined, { additionalPropertyInfoToConsiderWhenDetermining: 'Yes' });

      expect(capturedConfig.isAnswered(req)).toBe(false);
    });

    it('is answered when the citizen said no', () => {
      const req = makeReq(undefined, { additionalPropertyInfoToConsiderWhenDetermining: 'No' });

      expect(capturedConfig.isAnswered(req)).toBe(true);
    });
  });

  describe('details validator', () => {
    const validate = (value: unknown): boolean | string =>
      capturedConfig.fields[0].options[0].subFields[DETAILS].validator(value);

    it('accepts details up to the maximum length', () => {
      expect(validate('a'.repeat(MAX_LENGTH))).toBe(true);
    });

    it('returns the error key when the details are too long', () => {
      expect(validate('a'.repeat(MAX_LENGTH + 1))).toBe(`errors.${DETAILS}.maxLength`);
    });
  });

  describe('beforeRedirect', () => {
    it('clears the details when the answer is no', () => {
      const stepData = { [FIELD]: 'No', [DETAILS_KEY]: 'Left over' };

      capturedConfig.beforeRedirect(makeReq(stepData));

      expect(stepData[DETAILS_KEY]).toBe('');
    });

    it('keeps the details when the answer is yes', () => {
      const stepData = { [FIELD]: 'Yes', [DETAILS_KEY]: 'Near a busy road' };

      capturedConfig.beforeRedirect(makeReq(stepData));

      expect(stepData[DETAILS_KEY]).toBe('Near a busy road');
    });
  });

  describe('getInitialFormData', () => {
    it('returns the answer and details from the form data', () => {
      const req = makeReq({ [FIELD]: 'Yes', [DETAILS_KEY]: 'From the form' });

      expect(capturedConfig.getInitialFormData(req)).toEqual({ [FIELD]: 'Yes', [DETAILS_KEY]: 'From the form' });
    });

    it('falls back to the saved case', () => {
      const req = makeReq(undefined, {
        additionalPropertyInfoToConsiderWhenDetermining: 'Yes',
        additionalPropertyInfoToConsiderWhenDeterminingDetails: 'From the case',
      });

      expect(capturedConfig.getInitialFormData(req)).toEqual({ [FIELD]: 'Yes', [DETAILS_KEY]: 'From the case' });
    });

    it('leaves out saved details once the answer has changed to no', () => {
      const req = makeReq(
        { [FIELD]: 'No' },
        {
          additionalPropertyInfoToConsiderWhenDetermining: 'Yes',
          additionalPropertyInfoToConsiderWhenDeterminingDetails: 'Old details',
        }
      );

      expect(capturedConfig.getInitialFormData(req)).toEqual({ [FIELD]: 'No' });
    });

    it('returns nothing when the question has not been answered', () => {
      expect(capturedConfig.getInitialFormData(makeReq())).toEqual({});
    });
  });
});
