import { noticeLegallyValid } from '../functional/page-data/noticeLegallyValid.page.data';
const { I } = inject();

/**
11
* Page Load
12
*/
Given('the citizen is on the Notice Legally Valid page', () => {
  I.click(noticeLegallyValid.landLordNoticeProposingNewRentLink);
  I.click(noticeLegallyValid.saveAndContinueButton);
  I.waitForText(noticeLegallyValid.pageHeading, 10);
});

/**
19
* Yes Journey
20
*/
When('the citizen selects Yes for notice validity', () => {
  I.checkOption(noticeLegallyValid.yesOption);
});

When('the citizen clicks Save and continue', () => {
  I.click(noticeLegallyValid.saveAndContinueButton);
});

Then('the citizen is taken to the Hardship page', () => {
  I.waitInUrl(noticeLegallyValid.hardshipPageUrl, 10);
});

/**
34
* No Journey
35
*/
When('the citizen selects No for notice validity', () => {
  I.checkOption(noticeLegallyValid.noOption);
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

/**
60
* Save For Later
61
*/
When('the citizen clicks Save for later', () => {
  I.click(noticeLegallyValid.saveForLaterButton);
});

Then('the citizen is taken to the application dashboard', () => {
  I.waitInUrl(noticeLegallyValid.dashboardUrl, 10);
});

/**
71
* Validation
72
*/

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
