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

export const acceptedExtensions = (extraExtensions: readonly string[] = []): readonly string[] => [
  ...ALLOWED_EXTENSIONS,
  ...extraExtensions,
];

export const acceptAttributeFor = (extraExtensions: readonly string[] = []): string =>
  acceptedExtensions(extraExtensions).join(',');

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

export const validateFileType = (
  filename: string,
  mimeType: string,
  extraExtensions: readonly string[] = []
): UploadValidationError | undefined => {
  if (filename.length > maxFilenameLength()) {
    return 'filenameTooLong';
  }

  const normalisedMime = (mimeType || '').toLowerCase();
  if (!UNKNOWN_MIME_TYPES.has(normalisedMime) && ALLOWED_MIME_TYPES.has(normalisedMime)) {
    return undefined;
  }

  return acceptedExtensions(extraExtensions).includes(extensionOf(filename)) ? undefined : 'wrongFileType';
};

export interface UploadLimits {
  maxBytes?: number;
  maxTotalBytes?: number;
  extraExtensions?: readonly string[];
}

export const validateUploadedFile = (
  file: { originalname: string; mimetype: string; size: number },
  existingTotalBytes = 0,
  limits: UploadLimits = {}
): UploadValidationError | undefined => {
  const typeError = validateFileType(file.originalname, file.mimetype, limits.extraExtensions);
  if (typeError) {
    return typeError;
  }
  if (file.size > (limits.maxBytes ?? maxFileSizeBytes())) {
    return 'fileTooLarge';
  }
  if (existingTotalBytes + file.size > (limits.maxTotalBytes ?? maxTotalFileSizeBytes())) {
    return 'totalTooLarge';
  }
  return undefined;
};
