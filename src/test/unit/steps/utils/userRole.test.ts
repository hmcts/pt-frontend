import type { Request } from 'express';

import { getUserRoles, getUserType, isLandlordUser } from '../../../../main/steps/utils/userRole';

describe('isLegalRepresentativeUser', () => {
  it('returns true when roles contains solicitor', () => {
    const req = {
      session: {
        user: {
          roles: ['solicitor'],
        },
      },
    } as unknown as Request;
    expect(isLandlordUser(req)).toBe(true);
  });

  it('returns false when roles does not contain solicitor', () => {
    const req = {
      session: {
        user: {
          roles: ['citizen'],
        },
      },
    } as unknown as Request;
    expect(isLandlordUser(req)).toBe(false);
  });
});

describe('getUserType', () => {
  it('returns legalrep when roles contains solicitor', () => {
    const req = {
      session: {
        user: {
          roles: ['solicitor'],
        },
      },
    } as unknown as Request;
    expect(getUserType(req)).toBe('landlord');
  });

  it('returns citizen when roles does not contain solicitor', () => {
    const req = {
      session: {
        user: {
          roles: ['citizen'],
        },
      },
    } as unknown as Request;
    expect(getUserType(req)).toBe('citizen');
  });
});

describe('getUserRoles', () => {
  it('returns user roles when roles is an array', () => {
    const req = {
      session: {
        user: {
          roles: ['solicitor'],
        },
      },
    } as unknown as Request;
    expect(getUserRoles(req)).toStrictEqual(['solicitor']);
  });

  it('returns empty list when roles is not an array', () => {
    const req = {
      session: {
        user: {
          roles: 'citizen',
        },
      },
    } as unknown as Request;
    expect(getUserRoles(req)).toStrictEqual([]);
  });
});
