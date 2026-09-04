//Regex pattern for Help with Fees reference number: HWF-XXX-XXX where X is an alphanumeric character
const HELP_WITH_FEES_REFERENCE_PATTERN = /^HWF-[A-Z0-9]{3}-[A-Z0-9]{3}$/i;

export function isValidHelpWithFeesReference(reference: string): boolean {
  return HELP_WITH_FEES_REFERENCE_PATTERN.test(reference.trim());
}

// Trim whitespace and convert to uppercase so that the reference is stored in a consistent format
export function normaliseHelpWithFeesReference(reference: string): string {
  return reference.trim().toUpperCase();
}
