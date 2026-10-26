const CASE_REFERENCE_PATTERN = /^\d{16}$/;

/**
 * valid case reference must be exactly 16 digits.
 * @param caseReference - The case reference to validate (string or number)
 * @returns sanitised case reference as a string, or null if invalid
 */
export function sanitiseCaseReference(caseReference: string | number): string | null {
  const caseRefStr = String(caseReference);
  return CASE_REFERENCE_PATTERN.test(caseRefStr) ? caseRefStr : null;
}

export const normaliseCaseReference = (input: string): string => input.replace(/[\s-]/g, '');

export const isValidCaseReference = (input: string): boolean =>
  CASE_REFERENCE_PATTERN.test(normaliseCaseReference(input));

/**
 * Converts unknown input to a valid 16-digit case reference string.
 * If the input is not a valid 16-digit case reference, returns null.
 * This is useful for sanitizing session data before URL construction.
 *
 * @param value - The value to convert (can be any type)
 * @returns A valid 16-digit case reference string, or null if invalid
 *
 * @example
 * toCaseReference16('1234567890123456') // '1234567890123456'
 * toCaseReference16(null) // null
 * toCaseReference16('invalid') // null
 */
export function toCaseReference16(value: unknown): string | null {
  // Only accept string or number types
  if (typeof value !== 'string' && typeof value !== 'number') {
    return null;
  }

  const strValue = String(value).trim();
  return CASE_REFERENCE_PATTERN.test(strValue) ? strValue : null;
}

export function formatCaseReferenceForDisplay(caseReference: string): string {
  return caseReference.replace(/(\d{4})(?=\d)/g, '$1 ');
}
