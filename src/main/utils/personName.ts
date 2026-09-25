// Check string for valid person name characters (letters, spaces, hyphens, and apostrophes allowed only)
const PERSON_NAME_PATTERN = /^[A-Za-z' -]+$/;

export function isValidPersonName(name: string): boolean {
  return PERSON_NAME_PATTERN.test(name.trim());
}
