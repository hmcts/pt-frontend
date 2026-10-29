import config from 'config';

import { hasRequiredRole } from '../../../../main/auth/user/roles';

jest.mock('config', () => ({
  get: jest.fn(() => 'citizen'),
}));

describe('hasRequiredRole', () => {
  it.each([
    ['only the citizen role', { roles: ['citizen'] }, true],
    ['the citizen role alongside others', { roles: ['caseworker', 'citizen'] }, true],
    ['a different role', { roles: ['caseworker'] }, false],
    ['a role that only contains the word citizen', { roles: ['citizen-admin'] }, false],
    ['an empty role list', { roles: [] }, false],
    ['no roles', { roles: undefined }, false],
    ['no user', undefined, false],
  ])('returns %s → %s', (_label, user, expected) => {
    expect(hasRequiredRole(user as never)).toBe(expected);
  });

  it('reads the required role from config', () => {
    hasRequiredRole({ roles: ['citizen'] });

    expect(config.get).toHaveBeenCalledWith('idam.requiredRole');
  });
});
