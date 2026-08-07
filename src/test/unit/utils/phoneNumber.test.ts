import { isValidPhoneNumber } from '@utils/phoneNumber';

describe('isValidPhoneNumber', () => {
  it('should correctly validate phone number', () => {
    expect(isValidPhoneNumber('+447123456789')).toBe(true);
    expect(isValidPhoneNumber('+447 1234 56789')).toBe(true);
    expect(isValidPhoneNumber('07123456789')).toBe(true);
    expect(isValidPhoneNumber('071 23456 789')).toBe(true);
    expect(isValidPhoneNumber('invalid')).toBe(false);
    expect(isValidPhoneNumber('07l23456789')).toBe(false);
  });
});
