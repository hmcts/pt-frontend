import { helpWithFeesApplied } from '../functional/page-data/helpWithFeesApplied.page.data';

const { I } = inject();

Given('the citizen is on the Have you already applied for help with fees page', () => {
  I.click(helpWithFeesApplied.elgibleForHealthAndFees);
  I.click(helpWithFeesApplied.saveAndContinueButton);
  I.waitForText(helpWithFeesApplied.pageHeading, 10);
});

Then('the page content is displayed correctly', () => {
  I.see(helpWithFeesApplied.pageHeading, 'h1');
  I.see(helpWithFeesApplied.pageHintText);
  I.see(helpWithFeesApplied.yesOption);
  I.see(helpWithFeesApplied.noOption);
});

When('the citizen selects Yes', () => {
  I.checkOption(helpWithFeesApplied.yesOption);
});

When('the citizen selects No', () => {
  I.checkOption(helpWithFeesApplied.noOption);
});

Then('the help with fees reference number field is displayed', () => {
  I.seeElement(helpWithFeesApplied.referenceNumberField);
});

When('enters a valid help with fees reference number', () => {
  I.fillField(helpWithFeesApplied.referenceNumberField, helpWithFeesApplied.validReferenceNumber);
});

When('enters an invalid help with fees reference number', () => {
  I.fillField(helpWithFeesApplied.referenceNumberField, helpWithFeesApplied.invalidReferenceNumber);
});

When('clicks Save and continue', () => {
  I.click(helpWithFeesApplied.saveAndContinueButton);
});

Then('the citizen is taken to the Help with fees Check your answers page', () => {
  I.seeInCurrentUrl(helpWithFeesApplied.checkAnswerUrl);
});

Then('the citizen is taken to the You need to apply for help with fees page', () => {
  I.seeInCurrentUrl(helpWithFeesApplied.youNeedToApplyForHelpWithFees);
});

Then('the citizen sees the help with fees selection error', () => {
  I.see(helpWithFeesApplied.selectionError);
});

Then('the citizen sees the help with fees reference number required error', () => {
  I.see(helpWithFeesApplied.referenceRequiredError);
});

Then('the citizen sees the help with fees reference number format error', () => {
  I.see(helpWithFeesApplied.referenceFormatError);
});
