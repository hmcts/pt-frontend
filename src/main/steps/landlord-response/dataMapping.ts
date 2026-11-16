import type { Request } from 'express';

import { caseForThisRequest } from '../utils/dataMappingHelpers';

import type { PTCaseData } from '@services/ccd/ccdCase.interface';

export function prepareLandlordResponseDataForSave(
  sectionId: string,
  req: Request,
  ccdCase: PTCaseData | undefined
): Record<string, unknown> {
  const saved = caseForThisRequest(req, ccdCase);

  switch (sectionId) {
    case 'placeholder': {
      return {
        caseReference: saved?.caseReference,
      };
    }
    default:
      return {};
  }
}
