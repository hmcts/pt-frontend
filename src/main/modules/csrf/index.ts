import type { Express } from 'express';

/**
 * Reference: pcs-frontend/src/main/modules/csrf/index.ts
 * TODO: HDPD-501
 */
export class Csrf {
  enableFor(app: Express): void {
    void app;
  }
}
