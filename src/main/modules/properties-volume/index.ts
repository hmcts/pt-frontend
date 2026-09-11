import * as propertiesVolume from '@hmcts/properties-volume';
import config from 'config';
import { get, set } from 'lodash';

export class PropertiesVolume {
  async enableFor(environment: string): Promise<void> {
    if (environment !== 'development') {
      propertiesVolume.addTo(config);

      await this.setSecret('secrets.pt-kv1.pt-session-secret', 'session.pt-session-secret');
      await this.setSecret('secrets.pt-kv1.app-insights-connection-string', 'appInsights.connectionString');
      await this.setSecret('secrets.pt-kv1.idam-system-user-name', 'idam.systemUsername');
      await this.setSecret('secrets.pt-kv1.idam-system-user-password', 'idam.systemPassword');
      await this.setSecret('secrets.pt-kv1.pt-frontend-idam-secret', 'idam.clientSecret');
      await this.setSecret('secrets.pt-kv1.pt-frontend-s2s-secret', 'authProvider.secret');

      if (!process.env.REDIS_CONNECTION_STRING) {
        await this.setSecret('secrets.pt-kv1.redis-connection-string', 'session.redis-connection-string');
      }
    }
  }

  private async setSecret(fromPath: string, toPath: string): Promise<void> {
    if (config.has(fromPath)) {
      set(config, toPath, get(config, fromPath));
    } else {
      throw new Error(`Required secret not present in the properties volume: ${fromPath}`);
    }
  }
}
