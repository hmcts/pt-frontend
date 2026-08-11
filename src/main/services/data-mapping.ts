export function prepareDataForSave(sectionId: string, data: Record<string, unknown>): Record<string, unknown> {
  switch (sectionId) {
    case 'contactPreferences': {
      const contactByText = data?.textUpdates === 'Yes';
      return {
        applicantContactPreferencesTextUpdates: data?.textUpdates,
        applicantContactPreferencesTextUpdatesPhoneNumber: contactByText
          ? data?.['textUpdates.textUpdatesPhoneNumber']
          : null,
        applicantContactPreferencesPhoneNumberForCalls: data?.phoneNumberForCalls,
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
