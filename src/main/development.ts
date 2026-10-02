import * as path from 'path';

import * as express from 'express';

export const setupDev = (app: express.Express, developmentMode: boolean): void => {
  if (!developmentMode) {
    return;
  }

  const webpackDev = require('webpack-dev-middleware');
  const chokidar = require('chokidar');
  const webpack = require('webpack');
  const webpackconfig = require('../../webpack.config');
  const compiler = webpack(webpackconfig);

  app.use(webpackDev(compiler, { publicPath: '/' }));

  const viewsRoot = path.join(__dirname, 'views');
  const stepsRoot = path.join(__dirname, 'steps');
  const localesRoot = path.join(__dirname, 'assets', 'locales');

  chokidar
    .watch([viewsRoot, stepsRoot, localesRoot], {
      ignoreInitial: true,
      ignored: (p: string) => /node_modules|\.git/.test(p),
    })
    .on('all', async (_event: string, filePath: string) => {
      if (filePath.startsWith(localesRoot) && filePath.endsWith('.json')) {
        const i18next = require('i18next');
        await i18next.reloadResources();
      }
    });
};
