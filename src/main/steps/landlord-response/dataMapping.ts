import type { Request } from 'express';

import { caseForThisRequest } from '../utils/dataMappingHelpers';

import { getFormDataString } from '@modules/steps/formBuilder/helpers';
import type { PTCaseData } from '@services/ccd/ccdCase.interface';

const responseDescription = (
  answer: string | undefined,
  entered: string | undefined,
  saved: string | undefined
): string | undefined => (answer === 'Yes' ? (entered ?? saved) : '');

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
    case 'yourResponse': {
      const response = saved?.landlordResponse;
      const tenancyAnswer =
        getFormDataString(req, 'review-tenancy-details', 'respondToTenantAnswersAboutTenancyDetails') ??
        response?.respondToTenantAnswersAboutTenancyDetails;
      const propertyAnswer =
        getFormDataString(req, 'review-property-details', 'respondToTenantAnswersAboutPropertyDetails') ??
        response?.respondToTenantAnswersAboutPropertyDetails;

      return {
        landlordResponse: {
          respondToTenantAnswersAboutTenancyDetails: tenancyAnswer,
          respondToTenantAnswersAboutTenancyDetailsDescription: responseDescription(
            tenancyAnswer,
            getFormDataString(
              req,
              'review-tenancy-details',
              'respondToTenantAnswersAboutTenancyDetails.respondToTenantAnswersAboutTenancyDetailsDescription'
            ),
            response?.respondToTenantAnswersAboutTenancyDetailsDescription
          ),
          respondToTenantAnswersAboutPropertyDetails: propertyAnswer,
          respondToTenantAnswersAboutPropertyDetailsDescription: responseDescription(
            propertyAnswer,
            getFormDataString(
              req,
              'review-property-details',
              'respondToTenantAnswersAboutPropertyDetails.respondToTenantAnswersAboutPropertyDetailsDescription'
            ),
            response?.respondToTenantAnswersAboutPropertyDetailsDescription
          ),
        },
      };
    }
    default:
      return {};
  }
}
