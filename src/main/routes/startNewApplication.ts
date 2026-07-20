import { Application, Request, Response } from 'express';

export default function (app: Application): void {
  app.get('/start-new-application', (req: Request, res: Response) => {
    if (req.session?.user) {
      res.redirect('/new-application/application-type');
    } else {
      res.redirect('/login');
    }
  });
}
