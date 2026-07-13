import { Application, Request, Response } from 'express';

import myApplications from '@routes/myApplications';

describe('my applications route', () => {
  it('should render the myApplications view when logged in on GET /', () => {
    let handler: (req: Request, res: Response) => void = () => {};

    const app = {
      get: jest.fn((path: string, cb: (req: Request, res: Response) => void) => {
        if (path === '/') {
          handler = cb;
        }
      }),
    } as unknown as Application;

    myApplications(app);

    expect(app.get).toHaveBeenCalledWith('/', expect.any(Function));

    const req = {
      session: {
        user: {
          email: 'test@email.com',
        },
      },
    } as unknown as Request;
    const res = {
      render: jest.fn(),
    } as unknown as Response;

    handler(req, res);

    expect(res.render).toHaveBeenCalledWith('myApplications');
  });

  it('should redirect to login when not logged in on GET /', () => {
    let handler: (req: Request, res: Response) => void = () => {};

    const app = {
      get: jest.fn((path: string, cb: (req: Request, res: Response) => void) => {
        if (path === '/') {
          handler = cb;
        }
      }),
    } as unknown as Application;

    myApplications(app);

    expect(app.get).toHaveBeenCalledWith('/', expect.any(Function));

    const req = {} as Request;
    const res = {
      redirect: jest.fn(),
    } as unknown as Response;

    handler(req, res);

    expect(res.redirect).toHaveBeenCalledWith('/login');
  });
});
