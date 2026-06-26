import * as path from 'path';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express, { static as expressStatic } from 'express';
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

export const app = express();
app.locals.ENV = env;
app.locals.developmentMode = process.env.NODE_ENV !== 'production';

setupDev(app, developmentMode);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

new Session().enableFor(app);
new PropertiesVolume().enableFor(app.locals.ENV);
new AppInsights().enable();

modules.modules.forEach(async moduleName => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const moduleInstance = new (modules as any)[moduleName](developmentMode);
  await moduleInstance.enableFor(app);
});

app.get('/favicon.ico', limiter, (req, res) => {
  res.sendFile(path.join(__dirname, '/public/assets/images/favicon.ico'));
});
app.use(expressStatic(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate, no-store');
  next();
});

glob
  .sync(__dirname + '/routes/**/*.+(ts|js)')
  .map(filename => require(filename))
  .forEach(route => route.default(app));

setupErrorHandlers(app, env);
