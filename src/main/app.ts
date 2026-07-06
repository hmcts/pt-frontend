import { registerAllJourneys } from '@routes/registerSteps';
import * as path from 'path';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express, { static as expressStatic } from 'express';
import type { Express } from 'express';
import RateLimit from 'express-rate-limit';
import { glob } from 'glob';

import { setupDev } from './development';
import * as modules from './modules';

import { AppInsights } from '@modules/appinsights';
import { setupErrorHandlers } from '@modules/error-handler';
import { PropertiesVolume } from '@modules/properties-volume';
import { Session } from '@modules/session';

const env = process.env.NODE_ENV || 'development';
const developmentMode = env === 'development';

const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
});

export async function createApp(): Promise<Express> {
  const app = express();
  app.locals.ENV = env;
  app.locals.developmentMode = process.env.NODE_ENV !== 'production';

  setupDev(app, developmentMode);

  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  await new PropertiesVolume().enableFor(app.locals.ENV);
  new Session().enableFor(app);
  new AppInsights().enable();

  for (const moduleName of modules.modules) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moduleInstance = new (modules as any)[moduleName](developmentMode);
    await moduleInstance.enableFor(app);
  }

  app.get('/favicon.ico', limiter, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/assets/images/favicon.ico'));
  });
  app.use(expressStatic(path.join(__dirname, 'public')));
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate, no-store');
    next();
  });

  registerAllJourneys(app);

  glob
    .sync(__dirname + '/routes/**/*.+(ts|js)')
    .filter(filename => !filename.includes('registerSteps'))
    .map(filename => require(filename))
    .forEach(route => route.default(app));

  setupErrorHandlers(app, env);


  return app;
}
