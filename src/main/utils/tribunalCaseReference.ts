/**
 * A tribunal case reference has five slash-separated parts, for example
 * 'LON/00AD/SMO/2023/0001' — three letters, two digits followed by two letters,
 * three letters, a four-digit year, and four digits. Format confirmed with the
 * BA on HDPD-590.
 *
 * Matching is case-insensitive so users are not rejected for typing in lower
 * case; use normaliseTribunalCaseReference before storing.
 */
const TRIBUNAL_CASE_REFERENCE_PATTERN = /^[A-Z]{3}\/\d{2}[A-Z]{2}\/[A-Z]{3}\/\d{4}\/\d{4}$/i;

export function isValidTribunalCaseReference(caseReference: string): boolean {
  return TRIBUNAL_CASE_REFERENCE_PATTERN.test(caseReference.trim());
}

/** Uppercases and trims a reference so it is stored in a consistent form. */
export function normaliseTribunalCaseReference(caseReference: string): string {
  return caseReference.trim().toUpperCase();
}
