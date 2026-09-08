import config from 'config';

export const ALLOWED_EXTENSIONS = [
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.pdf',
  '.rtf',
  '.txt',
  '.csv',
  '.jpg',
  '.jpeg',
  '.png',
  '.bmp',
  '.tif',
  '.tiff',
];

export const ACCEPT_ATTRIBUTE_EXTENSIONS = ALLOWED_EXTENSIONS.join(',');

const ALLOWED_MIME_TYPES = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/pdf',
  'application/rtf',
  'text/rtf',
  'text/plain',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/bmp',
  'image/tiff',
]);

const UNKNOWN_MIME_TYPES = new Set(['', 'application/octet-stream']);

const asNumber = (key: string, fallback: number): number => {
  const value = config.has(key) ? Number(config.get(key)) : Number.NaN;
  return Number.isFinite(value) ? value : fallback;
};

export const maxFileSizeMB = (): number => asNumber('documentUpload.maxFileSizeMB', 100);
export const maxTotalFileSizeMB = (): number => asNumber('documentUpload.maxTotalFileSizeMB', 500);
export const maxFilenameLength = (): number => asNumber('documentUpload.maxFilenameLength', 255);

export const maxFileSizeBytes = (): number => maxFileSizeMB() * 1024 * 1024;
export const maxTotalFileSizeBytes = (): number => maxTotalFileSizeMB() * 1024 * 1024;

export const extensionOf = (filename: string): string => {
  const dot = filename.lastIndexOf('.');
  return dot < 0 ? '' : filename.slice(dot).toLowerCase();
};

export type UploadValidationError =
  | 'wrongFileType'
  | 'filenameTooLong'
  | 'fileTooLarge'
  | 'totalTooLarge'
  | 'noFileSelected';

export const validateFileType = (filename: string, mimeType: string): UploadValidationError | undefined => {
  if (filename.length > maxFilenameLength()) {
    return 'filenameTooLong';
  }

  const normalisedMime = (mimeType || '').toLowerCase();
  if (!UNKNOWN_MIME_TYPES.has(normalisedMime) && ALLOWED_MIME_TYPES.has(normalisedMime)) {
    return undefined;
  }

  return ALLOWED_EXTENSIONS.includes(extensionOf(filename)) ? undefined : 'wrongFileType';
};

export const validateUploadedFile = (
  file: { originalname: string; mimetype: string; size: number },
  existingTotalBytes = 0
): UploadValidationError | undefined => {
  const typeError = validateFileType(file.originalname, file.mimetype);
  if (typeError) {
    return typeError;
  }
  if (file.size > maxFileSizeBytes()) {
    return 'fileTooLarge';
  }
  if (existingTotalBytes + file.size > maxTotalFileSizeBytes()) {
    return 'totalTooLarge';
  }
  return undefined;
};
