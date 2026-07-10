import { Application, Request, Response } from 'express';

export default function (app: Application): void {
  app.get('/', (req: Request, res: Response) => {
    if (req.session?.user) {
      res.render('myApplications');
    } else {
      res.redirect('/login');
    }
  });
}
