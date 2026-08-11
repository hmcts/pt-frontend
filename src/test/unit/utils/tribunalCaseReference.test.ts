import { isValidTribunalCaseReference, normaliseTribunalCaseReference } from '@utils/tribunalCaseReference';

describe('isValidTribunalCaseReference', () => {
  it('should accept references in the tribunal format, regardless of case', () => {
    expect(isValidTribunalCaseReference('LON/00AD/SMO/2023/0001')).toBe(true);
    expect(isValidTribunalCaseReference('lon/00ad/smo/2023/0001')).toBe(true);
    expect(isValidTribunalCaseReference('Lon/00Ad/Smo/2023/0001')).toBe(true);
    expect(isValidTribunalCaseReference('MAN/99BB/SMO/1999/9999')).toBe(true);
  });

  it('should trim surrounding whitespace', () => {
    expect(isValidTribunalCaseReference('  LON/00AD/SMO/2023/0001  ')).toBe(true);
  });

  it('should reject the wrong number of parts', () => {
    expect(isValidTribunalCaseReference('LON/00AD/SMO/2023')).toBe(false);
    expect(isValidTribunalCaseReference('LON/00AD/SMO/2023/0001/0002')).toBe(false);
    expect(isValidTribunalCaseReference('LON-00AD-SMO-2023-0001')).toBe(false);
    expect(isValidTribunalCaseReference('')).toBe(false);
  });

  it('should reject parts of the wrong length', () => {
    expect(isValidTribunalCaseReference('LONG/00AD/SMO/2023/0001')).toBe(false);
    expect(isValidTribunalCaseReference('LO/00AD/SMO/2023/0001')).toBe(false);
    expect(isValidTribunalCaseReference('LON/00AD/SMO/23/0001')).toBe(false);
    expect(isValidTribunalCaseReference('LON/00AD/SMO/2023/1')).toBe(false);
  });

  it('should reject the second part unless it is two digits then two letters', () => {
    expect(isValidTribunalCaseReference('LON/0000/SMO/2023/0001')).toBe(false);
    expect(isValidTribunalCaseReference('LON/AAAA/SMO/2023/0001')).toBe(false);
    expect(isValidTribunalCaseReference('LON/A00D/SMO/2023/0001')).toBe(false);
    expect(isValidTribunalCaseReference('LON/0AD0/SMO/2023/0001')).toBe(false);
  });

  it('should reject digits where letters are expected', () => {
    expect(isValidTribunalCaseReference('L0N/00AD/SMO/2023/0001')).toBe(false);
    expect(isValidTribunalCaseReference('LON/00AD/SM0/2023/0001')).toBe(false);
  });
});

describe('normaliseTribunalCaseReference', () => {
  it('should uppercase and trim the reference', () => {
    expect(normaliseTribunalCaseReference('lon/00ad/smo/2023/0001')).toBe('LON/00AD/SMO/2023/0001');
    expect(normaliseTribunalCaseReference('  LON/00AD/SMO/2023/0001  ')).toBe('LON/00AD/SMO/2023/0001');
    expect(normaliseTribunalCaseReference('LON/00AD/SMO/2023/0001')).toBe('LON/00AD/SMO/2023/0001');
  });
});
