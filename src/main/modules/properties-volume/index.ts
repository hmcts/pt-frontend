import * as propertiesVolume from '@hmcts/properties-volume';
import config from 'config';
import { get, set } from 'lodash';

export class PropertiesVolume {
  async enableFor(environment: string): Promise<void> {
    if (environment !== 'development') {
      propertiesVolume.addTo(config);

      await this.setSecret('secrets.pt.AppInsightsInstrumentationKey', 'appInsights.instrumentationKey');
      await this.setSecret('secrets.pt.redis-connection-string', 'session.redis-connection-string');
      await this.setSecret('secrets.pt.pt-session-secret', 'session.pt-session-secret');
      await this.setSecret('secrets.pt.idam-system-user-name', 'idam.systemUsername');
      await this.setSecret('secrets.pt.idam-system-user-password', 'idam.systemPassword');
      await this.setSecret('secrets.pt.pt-frontend-idam-secret', 'idam.clientSecret');
      await this.setSecret('secrets.pt.pt-frontend-s2s-secret', 'authProvider.secret');
    }
  }

  private async setSecret(fromPath: string, toPath: string): Promise<void> {
    if (config.has(fromPath)) {
      set(config, toPath, get(config, fromPath));
    }
  }
}
