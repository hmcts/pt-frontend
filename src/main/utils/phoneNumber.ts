import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

// Parses the number; defaults to GB when no country code is given (e.g. 07...).
function parsePhoneNumber(phoneNumber: string) {
  return parsePhoneNumberFromString(phoneNumber, 'GB');
}

// Valid UK or international landline or mobile.
export function isValidPhoneNumber(phoneNumber: string): boolean {
  return parsePhoneNumber(phoneNumber)?.isValid() ?? false;
}

// Valid UK or international mobile only; landlines rejected.
export function isValidMobilePhoneNumber(phoneNumber: string): boolean {
  const parsedPhoneNumber = parsePhoneNumber(phoneNumber);

  return Boolean(parsedPhoneNumber?.isValid() && parsedPhoneNumber.getType() === 'MOBILE');
}
