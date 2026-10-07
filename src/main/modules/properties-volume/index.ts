import * as propertiesVolume from '@hmcts/properties-volume';
import config from 'config';
import { get, set } from 'lodash';

import { isLocalDev } from '@utils/environment';

export class PropertiesVolume {
  enable(): void {
    if (!isLocalDev()) {
      propertiesVolume.addTo(config);

      this.setSecret('secrets.pt-kv1.pt-session-secret', 'session.pt-session-secret');
      this.setSecret('secrets.pt-kv1.app-insights-connection-string', 'appInsights.connectionString');
      this.setSecret('secrets.pt-kv1.idam-system-user-name', 'idam.systemUsername');
      this.setSecret('secrets.pt-kv1.idam-system-user-password', 'idam.systemPassword');
      this.setSecret('secrets.pt-kv1.pt-frontend-idam-secret', 'idam.clientSecret');
      this.setSecret('secrets.pt-kv1.pt-frontend-s2s-secret', 'authProvider.secret');

      if (!process.env.REDIS_CONNECTION_STRING) {
        this.setSecret('secrets.pt-kv1.redis-connection-string', 'session.redis-connection-string');
      }
    }
  }

  private setSecret(fromPath: string, toPath: string): void {
    if (config.has(fromPath)) {
      set(config, toPath, get(config, fromPath));
    } else {
      throw new Error(`Required secret not present in the properties volume: ${fromPath}`);
    }
  }
}
