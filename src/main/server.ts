#!/usr/bin/env node
import config from 'config';

import { createApp } from './app';

import { Logger } from '@modules/logger';
import { isLocalDev } from '@utils/environment';

const logger = Logger.getLogger('server');

const PORT = process.env.PORT || 4000;
const HEADERS_TIMEOUT_MS = 20_000;
const KEEP_ALIVE_TIMEOUT_MS = 65_000;

let isShuttingDown = false;

async function startServer() {
  const app = await createApp();

  // used by shutdownCheck in readinessChecks
  setShuttingDown(false);

  const server = app.listen(PORT, () => {
    logger.info(`Application started: http://localhost:${PORT}`);
  });

  server.headersTimeout = HEADERS_TIMEOUT_MS;
  // Node default request timeout is 300s
  server.requestTimeout = config.get<number>('documentUpload.timeoutMs');
  server.keepAliveTimeout = KEEP_ALIVE_TIMEOUT_MS;

  return () => {
    setShuttingDown(true);
    server.close(() => process.exit(0));

    // force shutdown after 1000 in dev to kill the hmr websocket
    if (isLocalDev()) {
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
