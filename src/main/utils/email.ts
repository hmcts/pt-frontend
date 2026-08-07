export function isValidEmail(email: string): boolean {
  // strip whitespace
  const sanitisedEmail = email.trim();
  // one @, no whitespace either side, and a dot in the domain.
  // stricter patterns reject valid addresses (apostrophes, plus addressing) which would
  // block a citizen from applying
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(sanitisedEmail);
}
