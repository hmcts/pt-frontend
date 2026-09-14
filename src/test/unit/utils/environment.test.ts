import { isDiagnosticsEnabled, isLocalDev, isSecureTransport } from '@utils/environment';

describe('environment', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalAllowInsecure = process.env.ALLOW_INSECURE_COOKIES;

  const setEnv = (nodeEnv?: string, allowInsecure?: string): void => {
    if (nodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = nodeEnv;
    }
    if (allowInsecure === undefined) {
      delete process.env.ALLOW_INSECURE_COOKIES;
    } else {
      process.env.ALLOW_INSECURE_COOKIES = allowInsecure;
    }
  };

  afterEach(() => {
    setEnv(originalNodeEnv, originalAllowInsecure);
  });

  describe('isLocalDev', () => {
    it('is true only when NODE_ENV is development or unset', () => {
      setEnv('development');
      expect(isLocalDev()).toBe(true);

      setEnv(undefined);
      expect(isLocalDev()).toBe(true);
    });

    it('is false for every other NODE_ENV, so dev-only tooling never loads in a deployed image', () => {
      for (const nodeEnv of ['production', 'test', 'staging']) {
        setEnv(nodeEnv);
        expect(isLocalDev()).toBe(false);
      }
    });
  });

  describe('isDiagnosticsEnabled', () => {
    it('is on everywhere except production', () => {
      for (const nodeEnv of ['development', 'test', 'staging']) {
        setEnv(nodeEnv);
        expect(isDiagnosticsEnabled()).toBe(true);
      }

      setEnv('production');
      expect(isDiagnosticsEnabled()).toBe(false);
    });
  });

  describe('isSecureTransport', () => {
    it('is secure by default for any NODE_ENV other than local development', () => {
      for (const nodeEnv of ['production', 'test', 'staging']) {
        setEnv(nodeEnv);
        expect(isSecureTransport()).toBe(true);
      }
    });

    it('is insecure on a developer machine', () => {
      setEnv('development');
      expect(isSecureTransport()).toBe(false);
    });

    it('can be opted out of explicitly for serving over plain HTTP locally', () => {
      setEnv('test', 'true');
      expect(isSecureTransport()).toBe(false);
    });

    it('only opts out for the exact string "true"', () => {
      setEnv('test', 'false');
      expect(isSecureTransport()).toBe(true);

      setEnv('test', '1');
      expect(isSecureTransport()).toBe(true);
    });
  });
});
