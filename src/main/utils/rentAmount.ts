/**
 * A rent amount is a plain positive number with optional pence, for example
 * '850' or '850.50'. The '£' is rendered by the input's prefix and is not part
 * of the submitted value, so a typed '£' is rejected. Thousands separators are
 * rejected too, since the backend column is numeric(18,2) and stores a raw
 * number.
 *
 * Empty values are handled by the field's `required` check, not here, so that
 * 'you left it blank' and 'that is not a number' can show different messages
 * (HDPD-591 AC03 and AC04).
 */
const RENT_AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

export function isValidRentAmount(rentAmount: string): boolean {
  return RENT_AMOUNT_PATTERN.test(rentAmount.trim());
}
