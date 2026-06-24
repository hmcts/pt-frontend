/**
 * Reference: pcs-frontend/src/main/modules/logger/index.ts
 * Full implementation to be done in HDPD-554.
 */

type SimpleLogger = {
  info: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
};

export class Logger {
  public static getLogger(name: string): SimpleLogger {
    return {
      info: (message: string, ...args: unknown[]) => console.log(`[${name}]`, message, ...args),
      error: (message: string, ...args: unknown[]) => console.error(`[${name}]`, message, ...args),
    };
  }
}
