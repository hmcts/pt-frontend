import { NextFunction, Request, RequestHandler, Response } from 'express';

import { UserDetails } from '../auth/user/oidc';

import { Logger } from '@modules/logger';
import { getCaseApi } from '@services/ccd/ccdApiClient';
import { CaseRole } from '@services/ccd/ccdCase.interface';
import { toCaseReference16 } from '@utils/caseReference';

const logger = Logger.getLogger('requireCaseRole');

export function requireCaseRole(...allowedRoles: CaseRole[]): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const caseReference: string = toCaseReference16(req.params?.caseReference) as string;
    const user: UserDetails = req.session.user as UserDetails;
    const ccdCaseApi = getCaseApi(user);

    try {
      const caseUsers = await ccdCaseApi.getCaseUsers(caseReference, user);

      const isCaseRole = (role: string): role is CaseRole => (Object.values(CaseRole) as string[]).includes(role);

      const roles: CaseRole[] = (caseUsers ?? []).map((cu: { case_role: string }) => cu.case_role).filter(isCaseRole);

      if (!roles.some(role => allowedRoles.includes(role))) {
        logger.warn('User lacks required case role, redirecting to landing page', {
          userId: user.id,
          caseReference,
          allowedRoles,
          roles,
        });
        return res.redirect('/');
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
