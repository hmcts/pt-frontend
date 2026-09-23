import axios from 'axios';
import { transports } from 'winston';

import { Logger } from '@modules/logger';

const ansiEscapePattern = new RegExp(String.raw`\u001b\[[0-9;]*m`, 'g');
const stripAnsiCodes = (value: string): string => value.replace(ansiEscapePattern, '');
const messageSymbol = Symbol.for('message');

const USER_TOKEN = 'USER_TOKEN_SHOULD_NEVER_BE_LOGGED';
const S2S_TOKEN = 'S2S_TOKEN_SHOULD_NEVER_BE_LOGGED';
const CLIENT_SECRET = 'CLIENT_SECRET_SHOULD_NEVER_BE_LOGGED';

describe('logger module', () => {
  const formattedLines: string[] = [];
  let transportLogSpy: jest.SpyInstance;

  beforeEach(() => {
    formattedLines.length = 0;
    process.env.LOG_LEVEL = 'info';
    delete process.env.JSON_PRINT;

    transportLogSpy = jest.spyOn(transports.Console.prototype, 'log').mockImplementation((...args: unknown[]) => {
      const info = (args[0] ?? {}) as Record<PropertyKey, unknown>;
      const next = args[1] as (() => void) | undefined;
      const message = typeof info[messageSymbol] === 'string' ? info[messageSymbol] : info.message;
      formattedLines.push(String(message ?? ''));
      next?.();
    });
  });

  afterEach(() => {
    transportLogSpy.mockRestore();
    delete process.env.LOG_LEVEL;
  });

  it('logs trailing arguments without printf placeholders', () => {
    const logger = Logger.getLogger(`logger-trailing-${Date.now()}`);

    logger.info('Fetch config from:', 'https://issuer.example', { source: 'oidc' });

    const output = stripAnsiCodes(formattedLines.join('\n'));
    expect(output).toContain('Fetch config from:');
    expect(output).toContain('https://issuer.example');
    expect(output).toContain('"source":"oidc"');
    expect(output).not.toContain('https://issuer.example https://issuer.example');
  });

  it('logs additional arguments after placeholder interpolation', () => {
    const logger = Logger.getLogger(`logger-placeholder-${Date.now()}`);

    logger.info('Connecting to %s', 'redis', { healthy: true });

    const output = stripAnsiCodes(formattedLines.join('\n'));
    expect(output).toContain('Connecting to redis');
    expect(output).toContain('"healthy":true');
    expect(output).not.toContain('Connecting to redis redis');
  });
});

describe('logger credential redaction', () => {
  let lines: string[];
  let spy: jest.SpyInstance;

  beforeEach(() => {
    lines = [];
    process.env.LOG_LEVEL = 'error';
    spy = jest.spyOn(transports.Console.prototype, 'log').mockImplementation((...args: unknown[]) => {
      const info = (args[0] ?? {}) as Record<PropertyKey, unknown>;
      lines.push(String(info[messageSymbol] ?? info.message ?? ''));
      (args[1] as (() => void) | undefined)?.();
    });
  });

  afterEach(() => {
    spy.mockRestore();
    delete process.env.LOG_LEVEL;
    delete process.env.JSON_PRINT;
  });

  const logAllShapes = (err: unknown): string => {
    const logger = Logger.getLogger(`redaction-${Math.random()}`);
    logger.error(err as Error);
    logger.error('Request failed', err);
    logger.error('Request failed', err, { caseId: '123' });
    return lines.join('\n');
  };

  const failWith = async (url: string, body?: string): Promise<unknown> => {
    const client = axios.create({
      baseURL: url,
      headers: { Authorization: `Bearer ${USER_TOKEN}`, ServiceAuthorization: `Bearer ${S2S_TOKEN}` },
    });
    try {
      await (body ? client.post('/token', body) : client.get('/cases/1'));
    } catch (err) {
      return err;
    }
    throw new Error('expected the request to fail');
  };

  it.each([
    ['connection refused', 'http://127.0.0.1:59999'],
    ['pre-flight failure', 'gopher://example'],
  ])('redacts credentials from a %s in text format', async (_name, url) => {
    const output = logAllShapes(await failWith(url));

    expect(output).not.toContain(USER_TOKEN);
    expect(output).not.toContain(S2S_TOKEN);
    expect(output).not.toContain('Bearer ');
  });

  it('redacts credentials when JSON_PRINT is set', async () => {
    process.env.JSON_PRINT = 'true';
    const output = logAllShapes(await failWith('http://127.0.0.1:59999'));

    expect(output).not.toContain(USER_TOKEN);
    expect(output).not.toContain(S2S_TOKEN);
  });

  it('redacts the IDAM client secret, which travels in the request body', async () => {
    const err = await failWith('http://127.0.0.1:59999', `client_secret=${CLIENT_SECRET}&code=AUTH_CODE`);
    const output = logAllShapes(err);

    expect(output).not.toContain(CLIENT_SECRET);
    expect(output).not.toContain('AUTH_CODE');
  });

  it('keeps enough detail to diagnose the failure', async () => {
    const err = await failWith('http://127.0.0.1:59999');
    const output = logAllShapes(err);

    expect(output).toContain('Request failed');
    expect(output).toContain('ECONNREFUSED');
    expect(output).toContain('GET');
    expect(output).toContain('http://127.0.0.1:59999/cases/1');
  });

  it('does not mutate the error the caller rethrows', async () => {
    const err = (await failWith('http://127.0.0.1:59999')) as { config?: { headers?: Record<string, string> } };
    logAllShapes(err);

    expect(err.config?.headers?.Authorization).toBe(`Bearer ${USER_TOKEN}`);
  });
});

describe('logger binary redaction', () => {
  it('does not leave the logger-level format stringifying a raw buffer', () => {
    // winston defaults this format to json(), which expands a buffer byte by byte -- and aborts the
    // process outright on a large one -- before the transport gets a chance to redact it.
    const logger = Logger.getLogger(`binary-format-${Math.random()}`);
    const format = (
      logger as unknown as { format: { transform: (info: unknown, opts: unknown) => unknown; options: unknown } }
    ).format;

    const transformed = format.transform(
      { level: 'error', message: 'Document upload failed', file: Buffer.alloc(1024) },
      format.options
    ) as Record<PropertyKey, unknown>;

    expect(String(transformed[messageSymbol] ?? '')).not.toContain('"type":"Buffer"');
  });
});
