import { isValidPersonName, validatePersonName } from '@utils/personName';

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

describe('validatePersonaName', () => {
  it('returns tooShort when the name has fewer than 2 characters', () => {
    expect(validatePersonName('a', 'representativeFirstName')).toBe('errors.representativeFirstName.tooShort');
  });

  it('returns invalid when the name contains dissalowed characters', () => {
    expect(validatePersonName('John2', 'representativeLastName')).toBe('errors.representativeLastName.invalid');
  });

  it('returns true for a valid name', () => {
    expect(validatePersonName('Arthur-James', 'representativeFirstName')).toBe(true);
  });
});
