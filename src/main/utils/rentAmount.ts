/**
 * A rent amount is a plain positive number with optional pence, for example
 * '850' or '850.50'. The '£' is rendered by the input's prefix and is not part
 * of the submitted value, so a typed '£' is rejected. Thousands separators are
 * rejected too, since the backend column is numeric(18,2) and stores a raw
 * number.
 *
 * Returns why the amount is invalid rather than a bare boolean, so the step can
 * show a message that matches the mistake: 'invalid' for anything that is not a
 * plain number, 'decimalPlaces' for a number with more than two decimals.
 *
 * Empty values are handled by the field's `required` check, not here, so that
 * 'you left it blank' and 'that is not a number' can show different messages
 * (HDPD-591 AC03 and AC04).
 */
export type RentAmountError = 'invalid' | 'decimalPlaces';

const NUMBER_PATTERN = /^\d+(\.\d+)?$/;
const MAX_DECIMAL_PLACES = 2;

export function getRentAmountError(rentAmount: string): RentAmountError | undefined {
  const trimmed = rentAmount.trim();

  if (!NUMBER_PATTERN.test(trimmed)) {
    return 'invalid';
  }

  const decimals = trimmed.split('.')[1];
  if (decimals && decimals.length > MAX_DECIMAL_PLACES) {
    return 'decimalPlaces';
  }

  return undefined;
}
