import type { Request } from 'express';

import { caseForThisRequest } from '../utils/dataMappingHelpers';

import { getFormDataString } from '@modules/steps';
import type { PTCaseData } from '@services/ccd/ccdCase.interface';

export function prepareLandlordResponseDataForSave(
  sectionId: string,
  req: Request,
  ccdCase: PTCaseData | undefined
): Record<string, unknown> {
  const saved = caseForThisRequest(req, ccdCase);

  switch (sectionId) {
    case 'yourResponse': {
      const details = saved?.landlordResponse;
      return {
        landlordResponse: {
          landlordPhoneNumber:
            getFormDataString(req, 'your-phone-number', 'landlordPhoneNumber') ?? details?.landlordPhoneNumber,
        },
      };
    }
    default:
      return {};
  }
}
