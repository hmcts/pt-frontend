#!/usr/bin/env node
import { app } from './app';
import { Logger } from './modules/logger';

const logger = Logger.getLogger('server');

// used by shutdownCheck in readinessChecks
app.locals.shutdown = false;

// TODO: set the right port for your application
const port: number = parseInt(process.env.PORT || '4000', 10);

const server = app.listen(port, () => {
  logger.info(`Application started: http://localhost:${port}`);
});

function gracefulShutdownHandler(signal: string) {
  logger.info(`⚠️ Caught ${signal}, gracefully shutting down. Setting readiness to DOWN`);
  // stop the server from accepting new connections
  app.locals.shutdown = true;

  server.close();
  process.exit();
}

process.on('SIGINT', gracefulShutdownHandler);
process.on('SIGTERM', gracefulShutdownHandler);
