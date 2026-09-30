import { areYouChargedSeparately } from '../functional/page-data/areYouChargedSeparately.page.data';

const { I } = inject();

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

When('the citizen selects Yes', () => {
  I.checkOption(areYouChargedSeparately.yesOption);
});

When('the citizen clicks Save and continue', () => {
  I.click(areYouChargedSeparately.saveAndContinueButton);
});

Then('the citizen is taken to the next page', () => {
  I.see(areYouChargedSeparately.nextPageHeading);
  I.seeInCurrentUrl(areYouChargedSeparately.otherchargeDetailUrl);
});

When('the citizen selects No', () => {
  I.checkOption(areYouChargedSeparately.noOption);
});

Then('the citizen is taken to the current rent and other costs page', () => {
  I.see(areYouChargedSeparately.nextPageHeadingForNoOption);
});

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
