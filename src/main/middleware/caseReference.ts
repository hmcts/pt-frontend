import { NextFunction, Request, Response } from 'express';

import { HTTPError } from '../HttpError';

import { Logger } from '@modules/logger';
import { sanitiseCaseReference } from '@utils/caseReference';

const logger = Logger.getLogger('caseReferenceMiddleware');

export async function caseReferenceParamMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
  caseReference: string
): Promise<void> {
  const sanitisedCaseReference = sanitiseCaseReference(caseReference);

  if (!sanitisedCaseReference) {
    logger.error('Invalid case reference format', { caseReference });
    return next(new HTTPError('Invalid case reference format', 404));
  }

  req.params.caseReference = sanitisedCaseReference;
  return next();
}

// session.ccdCase is a single slot written only by task-list, so drop it when the case changes.
// formData needs no reset — it is already keyed per case.
export function caseSessionScopeMiddleware(req: Request, res: Response, next: NextFunction): void {
  const caseReference = typeof req.params?.caseReference === 'string' ? req.params.caseReference : undefined;

  if (caseReference && req.session.activeCaseReference !== caseReference) {
    logger.debug('Switching active case, clearing case-derived session state', {
      from: req.session.activeCaseReference,
      to: caseReference,
    });
    delete req.session.ccdCase;
    delete req.session.returnToCya;
    req.session.activeCaseReference = caseReference;
  }

  return next();
}
