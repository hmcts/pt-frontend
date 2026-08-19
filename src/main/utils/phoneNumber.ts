import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

// Parses the number; defaults to GB when no country code is given (e.g. 07...).
function parsePhoneNumber(phoneNumber: string) {
  return parsePhoneNumberFromString(phoneNumber, 'GB');
}

// Valid UK or international landline or mobile.
export function isValidPhoneNumber(phoneNumber: string): boolean {
  return parsePhoneNumber(phoneNumber)?.isValid() ?? false;
}

// Valid mobile, including shared mobile/landline ranges used by countries such as the US and Canada which are returned as FIXED_LINE_OR_MOBILE. Definite landlines are returned as FIXED_LINE and will not be accepted.
export function isValidMobilePhoneNumber(phoneNumber: string): boolean {
  const parsedPhoneNumber = parsePhoneNumber(phoneNumber);
  const phoneNumberType = parsedPhoneNumber?.getType();

  return Boolean(
    parsedPhoneNumber?.isValid() && (phoneNumberType === 'MOBILE' || phoneNumberType === 'FIXED_LINE_OR_MOBILE')
  );
}
