import { expect } from 'chai';
import type { Express, NextFunction, Request, Response } from 'express';
import request from 'supertest';

import { createApp } from '../../main/app';

let mockSessionUser: Record<string, unknown> | undefined;

jest.mock('jose', () => ({
  decodeJwt: jest.fn(() => ({ exp: Math.floor(Date.now() / 1000) + 3600 })),
}));

jest.mock('../../main/server', () => ({
  isShutdown: jest.fn(() => false),
}));

jest.mock('@modules/properties-volume', () => ({
  PropertiesVolume: jest.fn().mockImplementation(() => ({ enableFor: jest.fn().mockResolvedValue(undefined) })),
}));

jest.mock('../../main/auth/service/get-service-auth-token', () => ({
  initAuthToken: jest.fn().mockResolvedValue(undefined),
  stopAuthTokenRefresh: jest.fn(),
  requireServiceAuthToken: jest.fn(() => 'test-s2s-token'),
}));

jest.mock('@modules/session', () => {
  const session = jest.requireActual('express-session');
  return {
    Session: jest.fn().mockImplementation(() => ({
      enableFor: (app: Express) => {
        app.use(session({ secret: 'test', resave: false, saveUninitialized: false }));
        app.use((req: Request, _res: Response, next: NextFunction) => {
          if (mockSessionUser) {
            (req.session as unknown as Record<string, unknown>).user = mockSessionUser;
          }
          next();
        });
      },
    })),
  };
});

jest.mock('@services/ptApi/ptApiClient', () => ({
  getPtApi: jest.fn(() => ({
    getAllCasesByUser: jest
      .fn()
      .mockResolvedValue([{ caseReference: '1234123412341234', createdDate: '2026-07-28T10:54:13.43763' }]),
  })),
}));

describe('Routes', () => {
  let app: Express;

  beforeAll(async () => {
    app = await createApp();
  });

  afterEach(() => {
    mockSessionUser = undefined;
  });

  describe('GET /', () => {
    test('should redirect to login when not signed in', async () => {
      await request(app)
        .get('/')
        .expect(res => {
          expect(res.status).to.equal(302);
          expect(res.header.location).to.equal('/login');
        });
    });

    test('should list the user applications when signed in', async () => {
      mockSessionUser = { accessToken: 'token', id: 'user-id', email: 'citizen@example.com' };

      await request(app)
        .get('/')
        .expect(res => {
          expect(res.status).to.equal(200);
          expect(res.text).to.include('/1234123412341234/task-list');
        });
    });
  });

  describe('Language toggle', () => {
    test('should render English by default', async () => {
      await request(app)
        .get('/pre-application/starting-or-returning')
        .expect(res => {
          expect(res.status).to.equal(200);
          expect(res.text).to.include('Apply for an open market rent determination');
          expect(res.text).to.include('Cymraeg');
        });
    });

    test('should render Welsh when lang=cy', async () => {
      await request(app)
        .get('/pre-application/starting-or-returning?lang=cy')
        .expect(res => {
          expect(res.status).to.equal(200);
          expect(res.text).to.include('cy Apply for an open market rent determination');
          expect(res.text).to.include('English');
        });
    });
  });
});
