import config from 'config';

import { UserDetails } from './oidc';

export const hasRequiredRole = (user?: Pick<UserDetails, 'roles'>): boolean =>
  !!user?.roles?.includes(config.get<string>('idam.requiredRole'));
