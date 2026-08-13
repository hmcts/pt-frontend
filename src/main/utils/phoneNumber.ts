// validates whether a number is a valid landline or mobile number
export const VALID_PHONE_NUMBER_REGEX = /^(\+[1-9]\d{1,14}|0\d{10})$/;

// validates whether a number is a valid mobile phone number only
export const VALID_MOBILE_NUMBER_REGEX = /^(\+447\d{9}|07\d{9})$/;

export function isValidPhoneNumber(phoneNumber: string, regex: RegExp): boolean {
  // first strip the phone number of any whitespace/formatting, keep digits and leading +
  const sanitisedPhoneNumber = phoneNumber.replace(/\s+/g, '');
  // validates whether sanitisedPhoneNumber against provided regex
  return regex.test(sanitisedPhoneNumber);
}
