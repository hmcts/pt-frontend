import { Container, format, transports } from 'winston';

const { combine, label, timestamp, colorize, json, printf, splat } = format;
const splatSymbol = Symbol.for('splat');

const container = new Container();

function stringifyLogValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (value instanceof Error) {
    return value.stack ?? value.message;
  }
  if (typeof value === 'undefined') {
    return 'undefined';
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function extractMergedStringMetadata(metadata: Record<string, unknown>): string | null {
  const numericKeys = Object.keys(metadata)
    .filter(key => /^\d+$/.test(key))
    .sort((a, b) => Number(a) - Number(b));
  if (numericKeys.length === 0 || numericKeys[0] !== '0') {
    return null;
  }

  const characters: string[] = [];
  for (let index = 0; index < numericKeys.length; index += 1) {
    const key = String(index);
    if (numericKeys[index] !== key) {
      return null;
    }

    const character = metadata[key];
    if (typeof character !== 'string' || character.length !== 1) {
      return null;
    }

    characters.push(character);
  }

  numericKeys.forEach(key => {
    delete metadata[key];
  });

  return characters.join('');
}

const myFormat = printf((info: Record<string, unknown> & { [key: symbol]: unknown }) => {
  const { level, message, timestamp: logTimestamp, ...rawMetadata } = info;
  const metadata = { ...rawMetadata };
  const additionalValues = Array.isArray(info[splatSymbol]) ? (info[splatSymbol] as unknown[]) : [];
  const mergedStringValue = extractMergedStringMetadata(metadata);
  const allAdditionalValues = mergedStringValue ? [mergedStringValue, ...additionalValues] : additionalValues;
  const jsonMetadata = stringifyLogValue(metadata);
  const deduplicatedExtraValues = allAdditionalValues.filter(value => {
    const stringifiedValue = stringifyLogValue(value);
    if (stringifiedValue.length === 0) {
      return false;
    }
    if (typeof message === 'string' && message.includes(stringifiedValue)) {
      return false;
    }
    if (jsonMetadata !== '{}' && stringifiedValue === jsonMetadata) {
      return false;
    }
    return true;
  });
  const extraValues =
    deduplicatedExtraValues.length > 0 ? ` ${deduplicatedExtraValues.map(stringifyLogValue).join(' ')}` : '';
  const extraMetadata = jsonMetadata !== '{}' ? ` ${jsonMetadata}` : '';
  return `${logTimestamp} ${level}: ${message}${extraValues}${extraMetadata}`;
});

type Dict = Record<string, unknown>;

const isAxiosShaped = (value: unknown): value is Dict =>
  typeof value === 'object' &&
  value !== null &&
  ((value as Dict).isAxiosError === true || typeof (value as Dict).config === 'object');

function summariseAxiosError(error: Dict): Dict {
  const config = (error.config ?? {}) as Dict;
  const response = error.response as { status?: number; data?: unknown } | undefined;
  const data = response?.data;

  return {
    name: error.name,
    message: error.message,
    code: error.code,
    status: response?.status,
    method: typeof config.method === 'string' ? config.method.toUpperCase() : undefined,
    url: `${config.baseURL ?? ''}${config.url ?? ''}`,
    responseData: Buffer.isBuffer(data) ? `[Buffer ${data.length} bytes]` : data,
    stack: error.stack,
  };
}

const formatAxiosError = format(info => {
  const record = info as unknown as Record<string | symbol, unknown>;

  const splatValues = record[splatSymbol];
  if (Array.isArray(splatValues)) {
    record[splatSymbol] = splatValues.map(value =>
      isAxiosShaped(value) ? { error: summariseAxiosError(value) } : value
    );
  }

  return isAxiosShaped(info)
    ? ({
        level: info.level,
        message: info.message,
        timestamp: info.timestamp,
        error: summariseAxiosError(info),
        [Symbol.for('level')]: info[Symbol.for('level')],
        [splatSymbol]: record[splatSymbol],
      } as unknown as typeof info)
    : info;
});

const isColorizable = process.stdout.isTTY === true && process.env.CI !== 'true';

function transport(name: string) {
  const formatParts = [
    label({ label: name, message: true }),
    timestamp(),
    formatAxiosError(),
    splat(),
    ...(isColorizable ? [colorize({ all: true })] : []),
    process.env.JSON_PRINT ? json() : myFormat,
  ];
  return new transports.Console({
    level: (process.env.LOG_LEVEL || 'INFO').toLowerCase(),
    format: combine(...formatParts),
  });
}

export class Logger {
  public static getLogger(name: string): ReturnType<typeof container.add> {
    return container.add(name, { transports: [transport(name)] });
  }
}
