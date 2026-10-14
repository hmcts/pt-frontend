import { noticeLegallyValid } from '../functional/page-data/noticeLegallyValid.page.data';
const { I } = inject();

Given('the citizen is on the Notice Legally Valid page', () => {
  I.click(noticeLegallyValid.landLordNoticeProposingNewRentLink);
  I.click(noticeLegallyValid.saveAndContinueButton);
  I.waitForText(noticeLegallyValid.pageHeading, 10);
});

When('the citizen selects {string} for notice validity', (option: string) => {
  if (option === 'Yes') {
    I.checkOption(noticeLegallyValid.yesOption);
  } else {
    I.checkOption(noticeLegallyValid.noOption);
  }
});

When('the citizen clicks Save and continue', () => {
  I.click(noticeLegallyValid.saveAndContinueButton);
});

Then('the citizen is taken to the Hardship page', () => {
  I.waitInUrl(noticeLegallyValid.hardshipPageUrl, 10);
});

Then('the explanation text area is displayed', () => {
  I.seeElement('textarea');
  I.see(noticeLegallyValid.explainWhyTextArea);
});

When('the citizen enters details into the optional text area', () => {
  I.fillField(noticeLegallyValid.explainWhyTextArea, noticeLegallyValid.explanation);
});

Then('the citizen is taken to the Upload Evidence page', () => {
  I.waitForText(noticeLegallyValid.uploadEvidencePageHeading);
});

When('the citizen clicks Save for later', () => {
  I.click(noticeLegallyValid.saveForLaterButton);
});

Then('the citizen is taken to the application dashboard', () => {
  I.waitInUrl(noticeLegallyValid.dashboardUrl, 10);
});

When('the citizen clicks Save and continue without making a selection', () => {
  I.click(noticeLegallyValid.saveAndContinueButton);
});

Then('the notice validity validation error is displayed', () => {
  I.seeElement(noticeLegallyValid.errorSummarySelector);

  I.see(noticeLegallyValid.errorMessage, noticeLegallyValid.errorSummarySelector);

  I.see(noticeLegallyValid.errorMessage);
});

Then('the citizen remains on the Notice Legally Valid page', () => {
  I.seeInCurrentUrl(noticeLegallyValid.dashboardUrl);
});
