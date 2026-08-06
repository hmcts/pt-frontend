import { isValidRentAmount } from '@utils/rentAmount';

/**
 * A rent amount is entered as a plain number with optional pence, e.g. '850' or
 * '850.50'. The '£' is rendered as a prefix by the input component and is not
 * part of the submitted value, so a typed '£' is rejected.
 *
 * Empty values are the responsibility of the field's `required` check (AC04),
 * not this validator (AC03), so the two produce different error messages.
 */
describe('isValidRentAmount', () => {
  describe('valid amounts', () => {
    it.each(['1', '100', '1200', '0.99', '850.5', '950.50', '1234567.89'])('accepts %s', amount => {
      expect(isValidRentAmount(amount)).toBe(true);
    });

    it('ignores surrounding whitespace', () => {
      expect(isValidRentAmount('  850  ')).toBe(true);
    });
  });

  describe('invalid amounts', () => {
    it.each([
      ['letters', 'abc'],
      ['a typed pound sign', '£850'],
      ['a thousands separator', '1,200'],
      ['a negative amount', '-850'],
      // The backend column is numeric(18,2), so pence is the smallest unit stored.
      ['more than two decimal places', '850.555'],
      ['a trailing decimal point', '850.'],
      ['a leading decimal point', '.50'],
      ['whitespace only', '   '],
      ['an empty string', ''],
    ])('rejects %s', (_label, amount) => {
      expect(isValidRentAmount(amount)).toBe(false);
    });
  });
});
