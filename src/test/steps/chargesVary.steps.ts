import { chargesVary } from '../functional/page-data/chargesVary.page.data';

const { I } = inject();

/**
 * Page Load
 */

Given('the citizen is on the Charges Vary page', async () => {
  const currentUrl = await I.grabCurrentUrl();
  const targetUrl = currentUrl.replace('/task-list', chargesVary.url);
  I.amOnPage(targetUrl);
  I.waitForText(chargesVary.pageHeading, 10);
});

/**
 * Radio Selection
 */

When('the citizen selects Yes for charges vary', () => {
  I.checkOption(chargesVary.yesRadio);
});

When('the citizen selects No for charges vary', () => {
  I.checkOption(chargesVary.noRadio);
});

/**
 * Text Area
 */

When('the citizen enters charges variation details', () => {
  I.fillField(chargesVary.chargesVariationLabel, chargesVary.validVariationText);
});

When('the citizen leaves the variation details blank', () => {
  // intentionally blank
});

When('the citizen enters more than 500 characters', () => {
  const longText = 'A'.repeat(501);
  I.fillField(chargesVary.chargesVariationLabel, longText);
});

/**
51
* Buttons
52
*/

When('the citizen clicks charges vary Save and continue', () => {
  I.click(chargesVary.saveAndContinueButton);
});

When('the citizen clicks charges vary Save for later', () => {
  I.click(chargesVary.saveForLaterButton);
});

/**
63
* Assertions
64
*/

Then('the variation details text area is displayed', () => {
  I.seeElement('textarea');
  I.see(chargesVary.chargesVariationLabel);
});

Then('the citizen is navigated to the next page', () => {
  I.waitForText(chargesVary.nextPageurl, 10);
});

Then('the citizen is returned to the application dashboard', () => {
  I.waitForText(chargesVary.dashboardHeading, 10);
});

Then('the citizen sees the charges vary radio button validation error', () => {
  I.see(chargesVary.radioError);
});

Then('the citizen sees the variation details required error', () => {
  I.see(chargesVary.detailRequiredError);
});

Then('the citizen sees the 500 character validation error', () => {
  I.see(chargesVary.maxLengthError);
});
Then('the character count component is displayed', () => {
  I.see('500');
});
Then('the citizen sees the page heading', () => {
  I.see(chargesVary.pageHeading);
});

Then('the citizen sees the hint text', () => {
  I.see(chargesVary.hintText);
});

Then('the citizen sees Yes and No radio buttons', () => {
  I.see(chargesVary.yesRadio);
  I.see(chargesVary.noRadio);
});

Then('the citizen sees Save and continue and Save for later buttons', () => {
  I.see(chargesVary.saveAndContinueButton);
  I.see(chargesVary.saveForLaterButton);
});
