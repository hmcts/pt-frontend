import * as os from 'os';

import config from 'config';
import { Application } from 'express';

import loginRoute from '@routes/login';

jest.mock('os');
jest.mock('config');
jest.mock('express', () => ({
  Router: jest.fn().mockReturnValue({
    get: jest.fn(),
  }),
}));

const app = {
  get: jest.fn(),
  locals: {
    developmentMode: true,
  },
} as unknown as Application;

describe('login route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (config.get as jest.Mock).mockReturnValue(4000);
    (os.hostname as jest.Mock).mockReturnValue('fake-hostname');
  });

  it('should set up the /login routes', () => {
    loginRoute(app);

    expect(app.get).toHaveBeenCalledWith('/login', expect.any(Function));
    expect(app.get).toHaveBeenCalledWith('/logout', expect.any(Function));
    expect(app.get).toHaveBeenCalledWith('/oauth2/callback', expect.any(Function));
  });
});
