import type { Request } from 'express';

//TODO: establish what role a landlord will have and updated the following list
export const LANDLORD_USER_ROLES = ['solicitor'] as const;

export type UserType = 'citizen' | 'landlord';

export function getUserRoles(req: Request): string[] {
  const roles = req.session?.user?.roles;

  if (!Array.isArray(roles)) {
    return [];
  }

  return roles
    .filter((role): role is string => typeof role === 'string')
    .map(role => role.trim().toLowerCase())
    .filter(Boolean);
}

export function isLandlordUser(req: Request): boolean {
  return getUserRoles(req).some(role => LANDLORD_USER_ROLES.includes(role as (typeof LANDLORD_USER_ROLES)[number]));
}

export function getUserType(req: Request): UserType {
  if (isLandlordUser(req)) {
    return 'landlord';
  }

  return 'citizen';
}
