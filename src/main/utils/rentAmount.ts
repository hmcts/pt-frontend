/**
 * A rent amount is a plain positive number with optional pence, e.g. '850.50'.
 * The '£' is a prefix on the input and is not part of the submitted value.
 *
 * Returns the reason an amount is invalid rather than a boolean, so the step can
 * show a message matching the mistake. Empty values are left to the field's
 * `required` check so 'blank' and 'not a number' read differently.
 */
export type RentAmountError = 'invalid' | 'decimalPlaces' | 'tooLarge';

const NUMBER_PATTERN = /^\d+(\.\d+)?$/;

// numeric(18,2): 18 digits total, 2 after the point, so 16 before it.
const MAX_DECIMAL_PLACES = 2;
const MAX_INTEGER_DIGITS = 16;

export function getRentAmountError(rentAmount: string): RentAmountError | undefined {
  const trimmed = rentAmount.trim();

  if (!NUMBER_PATTERN.test(trimmed)) {
    return 'invalid';
  }

  const [integerDigits, decimals] = trimmed.split('.');

  if (decimals && decimals.length > MAX_DECIMAL_PLACES) {
    return 'decimalPlaces';
  }

  if (integerDigits.length > MAX_INTEGER_DIGITS) {
    return 'tooLarge';
  }

  return undefined;
}

/**
 * Rebuilds an amount for the input. A typed value is returned as entered. A saved
 * value comes back from the API as a number, so it is always shown to two decimal
 * places. A saved zero is a real answer and is kept.
 */
export function formatRentAmount(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value === 'string') {
    return value;
  }
  return Number(value).toFixed(2);
}

/**
 * Shows an amount on a summary page. Unlike the input, a typed value is also shown to
 * two decimal places, since the citizen is checking it rather than editing it.
 */
export function displayRentAmount(value: unknown): string | undefined {
  const amount = formatRentAmount(value);
  if (amount === undefined) {
    return undefined;
  }
  const parsed = Number(amount);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : amount;
}
