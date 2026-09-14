import { Request } from 'express';

import { getFormDataString } from '@modules/steps/formBuilder/helpers';
import { PTCaseData } from '@services/ccdCase.interface';
import { toCaseReference16 } from '@utils/caseReference';

/** Saved answers are only safe to fall back on when they belong to the case being written. */
function caseForThisRequest(req: Request, ccdCase: PTCaseData | undefined): PTCaseData | undefined {
  const routeCaseReference = toCaseReference16(req.params?.caseReference);
  if (!routeCaseReference || ccdCase?.caseReference === undefined) {
    return undefined;
  }
  return String(ccdCase.caseReference) === routeCaseReference ? ccdCase : undefined;
}

export function prepareDataForSave(
  sectionId: string,
  req: Request,
  ccdCase: PTCaseData | undefined
): Record<string, unknown> {
  const saved = caseForThisRequest(req, ccdCase);

  switch (sectionId) {
    case 'contactPreferences': {
      const contactByText =
        getFormDataString(req, 'text-updates', 'textUpdates') ?? saved?.applicantContactPreferences?.contactByText;
      const isContactByText = contactByText === 'Yes';
      return {
        applicantContactPreferences: {
          textUpdates: contactByText,
          textUpdatesPhoneNumber: isContactByText
            ? (getFormDataString(req, 'text-updates', 'textUpdates.textUpdatesPhoneNumber') ??
              saved?.applicantContactPreferences?.mobilePhoneNumber)
            : undefined,
          phoneNumberForCalls:
            getFormDataString(req, 'contact-by-phone', 'phoneNumberForCalls') ??
            saved?.applicantContactPreferences?.phoneNumber,
        },
      };
    }
    // case 'whoIsOnTheTenancy': {
    //   return {};
    // }
    // case 'landlordDetails': {
    //   return {};
    // }
    // case 'landlordsNotice': {
    //   return {};
    // }
    // case 'yourTenancyAgreement': {
    //   return {};
    // }
    // case 'theCurrentRentAndOtherCosts': {
    //   return {};
    // }
    // case 'whatYouThinkMarketRentShouldBe': {
    //   return {};
    // }
    // case 'propertyDetails': {
    //   return {};
    // }
    // case 'propertyInspection': {
    //   return {};
    // }
    // case 'extraSupport': {
    //   return {};
    // }
    // case 'tellUsIfYouNeedHelp': {
    //   return {};
    // }
    // case 'checkYourAnswersAndSubmit': {
    //   return {};
    // }
    default:
      return {};
  }
}
