import { isValidPersonName } from '@utils/personName';

describe('isValidPersonName', () => {
  it('should accept names with letters, spaces, hyphens and apostrophes', () => {
    expect(isValidPersonName('Mary')).toBe(true);
    expect(isValidPersonName('Mary-Jane')).toBe(true);
    expect(isValidPersonName("O'Brien")).toBe(true);
    expect(isValidPersonName('Van Dyke')).toBe(true);
    expect(isValidPersonName(' mary ')).toBe(true);
  });

  it('should reject names with digits, other punctuation or accented letters', () => {
    expect(isValidPersonName('John2')).toBe(false);
    expect(isValidPersonName('John@Doe')).toBe(false);
    expect(isValidPersonName('José')).toBe(false);
    expect(isValidPersonName('')).toBe(false);
    expect(isValidPersonName('   ')).toBe(false);
  });
});
