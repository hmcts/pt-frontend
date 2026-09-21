import { areYouChargedSeparately } from '../functional/page-data/areYouChargedSeparately.page.data';

const { I } = inject();

/**
11
* Page Load
12
*/
Given('the citizen is on the Are You Charged Separately page', async () => {
  const currentUrl = await I.grabCurrentUrl();
  const targetUrl = currentUrl.replace('/task-list', areYouChargedSeparately.url);
  I.amOnPage(targetUrl);
  I.waitForText(areYouChargedSeparately.pageHeading, 10);
});

Then('the page displays the correct content', () => {
  I.see(areYouChargedSeparately.pageHeading, 'h1');
  I.see(areYouChargedSeparately.hintText);
  I.see(areYouChargedSeparately.yesOption);
  I.see(areYouChargedSeparately.noOption);
  I.see(areYouChargedSeparately.saveAndContinueButton);
  I.see(areYouChargedSeparately.saveForLaterButton);
});

/**
30
* AC2 - Yes Selection
31
*/

When('the citizen selects Yes', () => {
  I.checkOption(areYouChargedSeparately.yesOption);
});

When('the citizen clicks Save and continue', () => {
  I.click(areYouChargedSeparately.saveAndContinueButton);
});

Then('the citizen is taken to the next page', () => {
  I.see(areYouChargedSeparately.nextPageHeading);
});

/**
45
* AC3 - No Selection
46
*/
When('the citizen selects No', () => {
  I.checkOption(areYouChargedSeparately.noOption);
});

Then('the citizen is taken to the current rent and other costs page', () => {
  I.see(areYouChargedSeparately.nextPageHeadingForNoOption);
});

/**
52
* AC4 - Validation Error
53
*/

When('the citizen clicks Save and continue without selecting an option', () => {
  I.click(areYouChargedSeparately.saveAndContinueButton);
});

Then('the validation error is displayed', () => {
  I.seeElement(areYouChargedSeparately.errorSummarySelector);
  I.see(areYouChargedSeparately.validationError, areYouChargedSeparately.errorSummarySelector);
  I.see(areYouChargedSeparately.validationError);
});

Then('the citizen remains on the same page', () => {
  I.seeInCurrentUrl(areYouChargedSeparately.url);
});
