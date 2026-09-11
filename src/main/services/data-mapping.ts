import { Request } from 'express';

import { PTCaseData } from '@services/ccdCase.interface';

export function prepareDataForSave(
  sectionId: string,
  req: Request,
  ccdCase: PTCaseData | undefined
): Record<string, unknown> {
  const allFormData = req.session.formData
    ? Object.values(req.session.formData).reduce((acc, stepData) => ({ ...acc, ...stepData }), {})
    : {};

  switch (sectionId) {
    case 'contactPreferences': {
      const contactByText = allFormData?.textUpdates ?? ccdCase?.applicantContactPreferences?.contactByText;
      const isContactByText = contactByText === 'Yes';
      return {
        applicantContactPreferences: {
          textUpdates: contactByText,
          textUpdatesPhoneNumber: isContactByText
            ? (allFormData?.['textUpdates.textUpdatesPhoneNumber'] ??
              ccdCase?.applicantContactPreferences?.mobilePhoneNumber)
            : undefined,
          phoneNumberForCalls: allFormData?.phoneNumberForCalls ?? ccdCase?.applicantContactPreferences?.phoneNumber,
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
