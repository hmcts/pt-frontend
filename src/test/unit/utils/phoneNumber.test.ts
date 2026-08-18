import { isValidMobilePhoneNumber, isValidPhoneNumber } from '@utils/phoneNumber';

describe('phone number validation', () => {
  it('should correctly validate UK and international phone numbers', () => {
    expect(isValidPhoneNumber('01303 715342')).toBe(true);
    expect(isValidPhoneNumber('07123 456789')).toBe(true);
    expect(isValidPhoneNumber('+44 20 7946 0018')).toBe(true);
    expect(isValidPhoneNumber('+33 1 42 34 56 78')).toBe(true);
    expect(isValidPhoneNumber('+33 6 12 34 56 78')).toBe(true);
    expect(isValidPhoneNumber('invalid')).toBe(false);
    expect(isValidPhoneNumber('07l23456789')).toBe(false);
    expect(isValidPhoneNumber('+999123456789')).toBe(false);
  });

  it('should correctly validate UK and international mobile phone numbers', () => {
    expect(isValidMobilePhoneNumber('07123 456789')).toBe(true);
    expect(isValidMobilePhoneNumber('+44 7123 456789')).toBe(true);
    expect(isValidMobilePhoneNumber('+33 6 12 34 56 78')).toBe(true);
    expect(isValidMobilePhoneNumber('+61 412 345 678')).toBe(true);
    expect(isValidMobilePhoneNumber('+1 415 555 0132')).toBe(true);
    expect(isValidMobilePhoneNumber('+1 416 555 0199')).toBe(true);
    expect(isValidMobilePhoneNumber('01303 715342')).toBe(false);
    expect(isValidMobilePhoneNumber('+44 20 7946 0018')).toBe(false);
    expect(isValidMobilePhoneNumber('+33 1 42 34 56 78')).toBe(false);
    expect(isValidMobilePhoneNumber('+1 800 555 0199')).toBe(false);
    expect(isValidMobilePhoneNumber('invalid')).toBe(false);
  });
});
