import type { Config } from 'config';

const SECRETS: Record<string, string> = {
  'pt-session-secret': 'test-session-secret',
  'app-insights-connection-string': 'InstrumentationKey=test',
  'idam-system-user-name': 'system.user@example.com',
  'idam-system-user-password': 'test-system-password',
  'pt-frontend-idam-secret': 'test-idam-secret',
  'pt-frontend-s2s-secret': 'test-s2s-secret',
  'redis-connection-string': 'redis://keyvault-redis:6379',
};

const SECRET_TARGETS: Record<string, string> = {
  'pt-session-secret': 'session.pt-session-secret',
  'app-insights-connection-string': 'appInsights.connectionString',
  'idam-system-user-name': 'idam.systemUsername',
  'idam-system-user-password': 'idam.systemPassword',
  'pt-frontend-idam-secret': 'idam.clientSecret',
  'pt-frontend-s2s-secret': 'authProvider.secret',
};

const load = (secrets: Record<string, string>) => {
  jest.resetModules();
  const addTo = jest.fn((cfg: Record<string, unknown>) => {
    cfg.secrets = { 'pt-kv1': secrets };
  });
  jest.doMock('@hmcts/properties-volume', () => ({ addTo }));
  const config: Config = require('config');
  const { PropertiesVolume } = require('@modules/properties-volume');
  return { config, addTo, propertiesVolume: new PropertiesVolume() };
};

const without = (key: string): Record<string, string> =>
  Object.fromEntries(Object.entries(SECRETS).filter(([name]) => name !== key));

describe('PropertiesVolume', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalRedis = process.env.REDIS_CONNECTION_STRING;

  const restore = (name: string, value: string | undefined): void => {
    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  };

  beforeEach(() => {
    process.env.NODE_ENV = 'production';
    delete process.env.REDIS_CONNECTION_STRING;
  });

  afterEach(() => {
    restore('NODE_ENV', originalNodeEnv);
    restore('REDIS_CONNECTION_STRING', originalRedis);
  });

  test('does not read the volume in local development', () => {
    process.env.NODE_ENV = 'development';
    const { addTo, propertiesVolume } = load({});

    expect(() => propertiesVolume.enable()).not.toThrow();
    expect(addTo).not.toHaveBeenCalled();
  });

  test('copies each secret onto the config key the app reads', () => {
    const { config, addTo, propertiesVolume } = load(SECRETS);

    propertiesVolume.enable();

    expect(addTo).toHaveBeenCalledWith(config);
    for (const [secret, target] of Object.entries(SECRET_TARGETS)) {
      expect(config.get(target)).toBe(SECRETS[secret]);
    }
    expect(config.get('session.redis-connection-string')).toBe(SECRETS['redis-connection-string']);
  });

  test('keeps REDIS_CONNECTION_STRING over the volume and does not require the redis secret', () => {
    process.env.REDIS_CONNECTION_STRING = 'redis://from-env:6379';
    const { config, propertiesVolume } = load(without('redis-connection-string'));

    expect(() => propertiesVolume.enable()).not.toThrow();
    expect(config.get('session.redis-connection-string')).toBe('redis://from-env:6379');
  });

  test.each(Object.keys(SECRETS))('fails fast when %s is missing', secret => {
    const { propertiesVolume } = load(without(secret));

    expect(() => propertiesVolume.enable()).toThrow(`secrets.pt-kv1.${secret}`);
  });
});
