export function isValidPhoneNumber(phoneNumber: string): boolean {
  // first strip the phone number of any whitespace/formatting, keep digits and leading +
  const sanitisedPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');
  // validates whether sanitisedPhoneNumber is a valid UK number (mobile or landline, starting 0)
  // or an international number (starting +)
  return /^(\+[1-9]\d{1,14}|0\d{10})$/.test(sanitisedPhoneNumber);
}
