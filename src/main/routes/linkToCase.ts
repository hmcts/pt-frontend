import { Application, Request, Response } from 'express';

export default function (app: Application): void {
  app.get('/link-to-case', (req: Request, res: Response) => {
    if (req.session?.user) {
      res.redirect('/link-party-to-case/enter-access-code');
    } else {
      res.redirect('/login');
    }
  });
}
