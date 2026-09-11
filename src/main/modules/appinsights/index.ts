import config from 'config';

const appInsights = require('applicationinsights');

export class AppInsights {
  enable(): void {
    const connectionString = config.get<string | false>('appInsights.connectionString');
    if (connectionString) {
      appInsights.setup(connectionString).setSendLiveMetrics(true).start();

      appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = 'pt-frontend';
      appInsights.defaultClient.trackTrace({
        message: 'App insights activated',
      });
    }
  }
}
