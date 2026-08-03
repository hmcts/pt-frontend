import { Application, Request, Response } from 'express';

import myApplications from '@routes/myApplications';

jest.mock('@services/ptApi/ptApiClient', () => {
  const getAllCasesByUserMock = jest.fn(() => [
    {
      caseReference: '1234123412341234',
      createdDate: '2026-07-28T10:54:13.43763',
    },
    {
      caseReference: '4321432143214321',
      createdDate: '2026-05-08T14:04:16.801467',
    },
  ]);

  return {
    getPtApi: jest.fn(() => ({
      getAllCasesByUser: getAllCasesByUserMock,
    })),
    __getAllCasesByUser: getAllCasesByUserMock, // expose it for the test
  };
});

describe('my applications route', () => {
  it('should render the myApplications view when logged in on GET /', async () => {
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

    await handler(req, res);

    expect(res.render).toHaveBeenCalledWith('myApplications', {
      applications: [
        [
          {
            html: '<a class="govuk-link govuk-link--no-visited-state" href="/1234123412341234/task-list">1234123412341234</a>',
          },
          {
            text: '28 July 2026',
          },
          {
            text: 'Not yet submitted',
          },
          {
            text: 'In progress',
          },
        ],
        [
          {
            html: '<a class="govuk-link govuk-link--no-visited-state" href="/4321432143214321/task-list">4321432143214321</a>',
          },
          {
            text: '08 May 2026',
          },
          {
            text: 'Not yet submitted',
          },
          {
            text: 'In progress',
          },
        ],
      ],
    });
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
