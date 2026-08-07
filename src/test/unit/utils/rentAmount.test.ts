import { getRentAmountError } from '@utils/rentAmount';

/**
 * A rent amount is entered as a plain number with optional pence, e.g. '850' or
 * '850.50'. The '£' is rendered as a prefix by the input component and is not
 * part of the submitted value, so a typed '£' is rejected.
 *
 * Returns the reason the amount is invalid so the step can show a message that
 * matches the mistake, or undefined when the amount is valid. Empty values are
 * the responsibility of the field's `required` check (AC04), not this validator.
 */
describe('getRentAmountError', () => {
  describe('valid amounts', () => {
    it.each(['1', '100', '1200', '0.99', '850.5', '950.50', '1033.33', '1234567.89'])('accepts %s', amount => {
      expect(getRentAmountError(amount)).toBeUndefined();
    });

    it('ignores surrounding whitespace', () => {
      expect(getRentAmountError('  850  ')).toBeUndefined();
    });
  });

  describe('amounts that are not numbers', () => {
    it.each([
      ['letters', 'abc'],
      ['a typed pound sign', '£850'],
      ['a thousands separator', '1,200'],
      ['a negative amount', '-850'],
      ['a trailing decimal point', '850.'],
      ['a leading decimal point', '.50'],
      ['whitespace only', '   '],
      ['an empty string', ''],
    ])('rejects %s as not a number', (_label, amount) => {
      expect(getRentAmountError(amount)).toBe('invalid');
    });
  });

  describe('amounts with too many decimal places', () => {
    // The backend column is numeric(18,2), so pence is the smallest unit stored.
    it.each(['1033.333', '850.555', '0.001'])('rejects %s for decimal places', amount => {
      expect(getRentAmountError(amount)).toBe('decimalPlaces');
    });
  });
});
