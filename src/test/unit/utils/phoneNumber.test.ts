import { VALID_MOBILE_NUMBER_REGEX, VALID_PHONE_NUMBER_REGEX, isValidPhoneNumber } from '@utils/phoneNumber';

describe('isValidPhoneNumber', () => {
  it('should correctly validate phone number', () => {
    expect(isValidPhoneNumber('01303715342', VALID_PHONE_NUMBER_REGEX)).toBe(true);
    expect(isValidPhoneNumber('01303715342', VALID_MOBILE_NUMBER_REGEX)).toBe(false);
    expect(isValidPhoneNumber('01303 715342', VALID_PHONE_NUMBER_REGEX)).toBe(true);
    expect(isValidPhoneNumber('01303 715342', VALID_MOBILE_NUMBER_REGEX)).toBe(false);
    expect(isValidPhoneNumber('+447123456789', VALID_PHONE_NUMBER_REGEX)).toBe(true);
    expect(isValidPhoneNumber('+447123456789', VALID_MOBILE_NUMBER_REGEX)).toBe(true);
    expect(isValidPhoneNumber('+447 1234 56789', VALID_PHONE_NUMBER_REGEX)).toBe(true);
    expect(isValidPhoneNumber('+447 1234 56789', VALID_MOBILE_NUMBER_REGEX)).toBe(true);
    expect(isValidPhoneNumber('07123456789', VALID_PHONE_NUMBER_REGEX)).toBe(true);
    expect(isValidPhoneNumber('07123456789', VALID_MOBILE_NUMBER_REGEX)).toBe(true);
    expect(isValidPhoneNumber('071 23456 789', VALID_PHONE_NUMBER_REGEX)).toBe(true);
    expect(isValidPhoneNumber('071 23456 789', VALID_MOBILE_NUMBER_REGEX)).toBe(true);
    expect(isValidPhoneNumber('invalid', VALID_PHONE_NUMBER_REGEX)).toBe(false);
    expect(isValidPhoneNumber('invalid', VALID_MOBILE_NUMBER_REGEX)).toBe(false);
    expect(isValidPhoneNumber('07l23456789', VALID_PHONE_NUMBER_REGEX)).toBe(false);
    expect(isValidPhoneNumber('07l23456789', VALID_MOBILE_NUMBER_REGEX)).toBe(false);
  });
});
