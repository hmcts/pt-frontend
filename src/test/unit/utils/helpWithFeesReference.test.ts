import { isValidHelpWithFeesReference, normaliseHelpWithFeesReference } from '@utils/helpWithFeesReference';

describe('isValidHelpWithFeesReference', () => {
  it('should accept references in the Help with Fees format, regardless of case', () => {
    expect(isValidHelpWithFeesReference('HWF-A1B-23C')).toBe(true);
    expect(isValidHelpWithFeesReference('hwf-a1b-23c')).toBe(true);
    expect(isValidHelpWithFeesReference('HwF-A1B-23C')).toBe(true);
    expect(isValidHelpWithFeesReference('HWF-X9Y-88Z')).toBe(true);
  });

  it('should trim surrounding whitespace', () => {
    expect(isValidHelpWithFeesReference('  HWF-A1B-23C  ')).toBe(true);
  });

  it('should reject references that do not match the format', () => {
    expect(isValidHelpWithFeesReference('HWF-A1B-23')).toBe(false);
    expect(isValidHelpWithFeesReference('HWF-A1B23C')).toBe(false);
    expect(isValidHelpWithFeesReference('HWF-AB-CDE')).toBe(false);
    expect(isValidHelpWithFeesReference('')).toBe(false);
  });
});

describe('normaliseHelpWithFeesReference', () => {
  it('should uppercase and trim the reference', () => {
    expect(normaliseHelpWithFeesReference('hwf-a1b-23c')).toBe('HWF-A1B-23C');
    expect(normaliseHelpWithFeesReference('  HWF-A1B-23C  ')).toBe('HWF-A1B-23C');
  });
});
