import { hardship } from '../functional/page-data/hardship.page.data';
import { noticeLegallyValid } from '../functional/page-data/noticeLegallyValid.page.data';

const { I } = inject();

/**
* Page Load
11
*/

Given('the citizen is on the Hardship page', () => {
  I.click(noticeLegallyValid.landLordNoticeProposingNewRentLink);
  I.click(noticeLegallyValid.saveAndContinueButton);
  I.waitForText(noticeLegallyValid.pageHeading, 10);
  I.checkOption(noticeLegallyValid.yesOption);
  I.click(noticeLegallyValid.saveAndContinueButton);
  I.waitForText(hardship.pageHeading, 10);
});

/**
19
* Radio Selection
20
*/

When('the citizen selects Yes for hardship', () => {
  I.checkOption(hardship.yesRadio);
});

When('the citizen selects No for hardship', () => {
  I.checkOption(hardship.noRadio);
});

/**
31
* Button Actions
32
*/

When('the citizen clicks hardship Save and continue', () => {
  I.click(hardship.saveAndContinueButton);
});

When('the citizen clicks hardship Save for later', () => {
  I.click(hardship.saveForLaterButton);
});

/**
43
* Assertions
44
*/

Then('the citizen is navigated to the Upload Supporting Evidence page', () => {
  I.waitForText(hardship.uploadEvidenceHeading, 10);
});

Then('the citizen is navigated to the Check your answers page', () => {
  I.waitForText(hardship.cyaHeading, 10);
});

Then('the citizen is returned to the application dashboard', () => {
  I.waitForText(hardship.dashboardHeading, 10);
});

Then('the citizen sees the hardship validation error', () => {
  I.see(hardship.hardshipError);
});

Then('the citizen remains on the Hardship page', () => {
  I.see(hardship.pageHeading);
});

/**
70
* AC1 Page Content Assertions
71
*/

Then('the citizen sees the hardship page heading', () => {
  I.see(hardship.pageHeading);
});

Then('the citizen sees hardship radio buttons', () => {
  I.see(hardship.yesRadio);
  I.see(hardship.noRadio);
});

Then('the citizen sees hardship action buttons', () => {
  I.see(hardship.saveAndContinueButton);
  I.see(hardship.saveForLaterButton);
});
