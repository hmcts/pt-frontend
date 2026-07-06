#!/usr/bin/env node
import { createApp } from './app';

import { Logger } from '@modules/logger';

const logger = Logger.getLogger('server');

const PORT = process.env.PORT || 4000;

let isShuttingDown = false;

async function startServer() {
  const app = await createApp();

  // used by shutdownCheck in readinessChecks
  setShuttingDown(false);

  const server = app.listen(PORT, () => {
    logger.info(`Application started: http://localhost:${PORT}`);
  });

  return () => {
    setShuttingDown(true);
    server.close(() => process.exit(0));

    // force shutdown after 1000 in dev to kill the hmr websocket
    if (process.env.NODE_ENV !== 'production') {
      setTimeout(() => process.exit(0), 1000).unref();
    }
  };
}

startServer()
  .then(shutdown => {
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  })
  .catch(err => {
    logger.error('Failed to start server', err);
    process.exit(1);
  });

export function setShuttingDown(value: boolean): void {
  isShuttingDown = value;
}

export function isShutdown(): boolean {
  return isShuttingDown;
}
