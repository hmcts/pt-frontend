import { extensionOf, validateFileType, validateUploadedFile } from '@utils/documentUploadValidation';

const file = (overrides: Partial<{ originalname: string; mimetype: string; size: number }> = {}) => ({
  originalname: 'floor-plan.pdf',
  mimetype: 'application/pdf',
  size: 1024,
  ...overrides,
});

describe('documentUploadValidation', () => {
  describe('extensionOf', () => {
    test.each([
      ['floor-plan.pdf', '.pdf'],
      ['FLOOR-PLAN.PDF', '.pdf'],
      ['archive.tar.gz', '.gz'],
      ['no-extension', ''],
    ])('%s -> %s', (filename, expected) => {
      expect(extensionOf(filename)).toBe(expected);
    });
  });

  describe('validateFileType', () => {
    test('accepts an allowed mime type', () => {
      expect(validateFileType('floor-plan.pdf', 'application/pdf')).toBeUndefined();
    });

    test('rejects a disallowed mime type', () => {
      expect(validateFileType('script.exe', 'application/x-msdownload')).toBe('wrongFileType');
    });

    test('falls back to the extension when the browser could not sniff a type', () => {
      expect(validateFileType('floor-plan.pdf', '')).toBeUndefined();
      expect(validateFileType('floor-plan.pdf', 'application/octet-stream')).toBeUndefined();
      expect(validateFileType('script.exe', 'application/octet-stream')).toBe('wrongFileType');
    });

    test('rejects an over-long filename before anything else', () => {
      expect(validateFileType(`${'a'.repeat(300)}.pdf`, 'application/pdf')).toBe('filenameTooLong');
    });
  });

  describe('validateUploadedFile', () => {
    const MiB = 1024 * 1024;

    test('accepts a valid file', () => {
      expect(validateUploadedFile(file())).toBeUndefined();
    });

    it('accepts a file of exactly 25MB in binary units', () => {
      expect(validateUploadedFile(file({ size: 25 * MiB }))).toBeUndefined();
    });

    it('rejects a file one byte over 25MB in binary units', () => {
      expect(validateUploadedFile(file({ size: 25 * MiB + 1 }))).toBe('fileTooLarge');
    });

    it('accepts a file shown as 24MB by Windows and ls -lh', () => {
      expect(validateUploadedFile(file({ size: 25_165_824 }))).toBeUndefined();
    });

    test('rejects a file over the per-file cap', () => {
      expect(validateUploadedFile(file({ size: 26 * 1024 * 1024 }))).toBe('fileTooLarge');
    });

    test('rejects a file that would push the case over the total cap', () => {
      expect(validateUploadedFile(file({ size: 10 * 1024 * 1024 }), 291 * 1024 * 1024)).toBe('totalTooLarge');
    });

    test('rejects an empty file', () => {
      expect(validateUploadedFile(file({ size: 0 }))).toBe('fileEmpty');
    });

    test('reports the type problem ahead of the size problem', () => {
      expect(validateUploadedFile(file({ originalname: 'big.exe', mimetype: '', size: 400 * 1024 * 1024 }))).toBe(
        'wrongFileType'
      );
    });
  });
});
