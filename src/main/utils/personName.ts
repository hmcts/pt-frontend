import { getTextLengthError } from 'steps/utils/fieldValidators';

// Check string for valid person name characters (letters, spaces, hyphens, and apostrophes allowed only)
const PERSON_NAME_PATTERN = /^[A-Za-z' -]+$/;

export function isValidPersonName(name: string): boolean {
  return PERSON_NAME_PATTERN.test(name.trim());
}

export function validatePersonName(value: unknown, fieldName: string): boolean | string {
  if (value && getTextLengthError(value as string, 2, 100) === 'tooShort') {
    return `errors.${fieldName}.tooShort`;
  }
  if (value && !isValidPersonName(value as string)) {
    return `errors.${fieldName}.invalid`;
  }

  return true;
}
