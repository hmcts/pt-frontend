import type { Request } from 'express';

import { createFormStep } from '@modules/steps';

import '../../../../main/steps/landlord-response/your-response/your-phone-number/index';

jest.mock('@modules/steps', () => ({
  ...jest.requireActual('@modules/steps'),
  createFormStep: jest.fn(),
}));

const CASE_REF = '1234123412341234';
const STEP_NAME = 'your-phone-number';
const FIELD_NAME = 'landlordPhoneNumber';

describe('landlord-response your-phone-number step', () => {
  const capturedConfig = (createFormStep as jest.Mock).mock.calls.find(([config]) => config.stepName === STEP_NAME)[0];

  const makeReq = (stepData?: Record<string, unknown>, ccdCase?: Record<string, unknown>): Request =>
    ({
      params: { caseReference: CASE_REF },
      session: { formData: stepData ? { [CASE_REF]: { [STEP_NAME]: stepData } } : {}, ccdCase },
    }) as unknown as Request;

  const withSavedNumber = (landlordPhoneNumber?: string): Record<string, unknown> => ({
    landlordResponse: { landlordPhoneNumber },
  });

  describe('isAnswered', () => {
    it('is not answered when there is no ccd case', () => {
      expect(capturedConfig.isAnswered(makeReq())).toBe(false);
    });

    it('is not answered when no landlord response exists', () => {
      expect(capturedConfig.isAnswered(makeReq(undefined, {}))).toBe(false);
    });

    it.each([undefined, ''])('is not answered when the saved phone number is %p', value => {
      expect(capturedConfig.isAnswered(makeReq(undefined, withSavedNumber(value)))).toBe(false);
    });

    it.each(['07123 456789', '01303 715342', '+44 808 157 0192'])(
      'is answered when a valid phone number %s has been saved',
      value => {
        expect(capturedConfig.isAnswered(makeReq(undefined, withSavedNumber(value)))).toBe(true);
      }
    );

    it('is not answered when the saved phone number is not valid', () => {
      expect(capturedConfig.isAnswered(makeReq(undefined, withSavedNumber('invalid')))).toBe(false);
    });
  });

  describe('validator', () => {
    const validate = (value: unknown): boolean | string => capturedConfig.fields[0].validator(value);

    it.each(['01303 715342', '07123 456789', '+44 808 157 0192', '+33 1 42 34 56 78'])(
      'accepts a valid phone number %s',
      value => {
        expect(validate(value)).toBe(true);
      }
    );

    it.each(['07l23456789', 'not a number', '123', '0770090098212345'])(
      'returns the invalid error key for %s',
      value => {
        expect(validate(value)).toBe('errors.landlordPhoneNumber.invalid');
      }
    );
  });

  describe('getInitialFormData', () => {
    it('returns an empty object when nothing has been entered or saved', () => {
      expect(capturedConfig.getInitialFormData(makeReq(undefined, {}))).toEqual({});
    });

    it('prefills from the saved ccd case', () => {
      expect(capturedConfig.getInitialFormData(makeReq(undefined, withSavedNumber('07123 456789')))).toEqual({
        [FIELD_NAME]: '07123 456789',
      });
    });

    it('prefers the session form data over the saved ccd case', () => {
      expect(
        capturedConfig.getInitialFormData(makeReq({ [FIELD_NAME]: '01303 715342' }, withSavedNumber('07123 456789')))
      ).toEqual({ [FIELD_NAME]: '01303 715342' });
    });

    it('returns session form data even when it is invalid, so the user can correct it', () => {
      expect(capturedConfig.getInitialFormData(makeReq({ [FIELD_NAME]: 'abc' }))).toEqual({ [FIELD_NAME]: 'abc' });
    });

    it('omits the field when the saved value is an empty string', () => {
      expect(capturedConfig.getInitialFormData(makeReq(undefined, withSavedNumber('')))).toEqual({});
    });
  });
});
