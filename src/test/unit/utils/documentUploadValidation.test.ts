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
    test('accepts a valid file', () => {
      expect(validateUploadedFile(file())).toBeUndefined();
    });

    test('rejects a file over the per-file cap', () => {
      expect(validateUploadedFile(file({ size: 101 * 1024 * 1024 }))).toBe('fileTooLarge');
    });

    test('rejects a file that would push the case over the total cap', () => {
      expect(validateUploadedFile(file({ size: 10 * 1024 * 1024 }), 499 * 1024 * 1024)).toBe('totalTooLarge');
    });

    test('reports the type problem ahead of the size problem', () => {
      expect(validateUploadedFile(file({ originalname: 'big.exe', mimetype: '', size: 200 * 1024 * 1024 }))).toBe(
        'wrongFileType'
      );
    });
  });
});
