import { Application } from 'express';

export default function (app: Application): void {
  app.get('/', (req, res) => {
    res.render('home');
  });

  app.get('/test-error', (_req, _res) => {
    throw new Error();
  });
}
