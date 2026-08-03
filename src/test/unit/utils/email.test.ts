import { isValidEmail } from '@utils/email';

describe('isValidEmail', () => {
  it('should accept correctly formatted email addresses', () => {
    expect(isValidEmail('landlord@example.com')).toBe(true);
    expect(isValidEmail('first.last@example.co.uk')).toBe(true);
    expect(isValidEmail('landlord+notices@example.com')).toBe(true);
    expect(isValidEmail("o'brien@example.com")).toBe(true);
    expect(isValidEmail(' landlord@example.com ')).toBe(true);
  });

  it('should reject incorrectly formatted email addresses', () => {
    expect(isValidEmail('landlord')).toBe(false);
    expect(isValidEmail('landlord@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('landlord@example')).toBe(false);
    expect(isValidEmail('land lord@example.com')).toBe(false);
    expect(isValidEmail('landlord@@example.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});
