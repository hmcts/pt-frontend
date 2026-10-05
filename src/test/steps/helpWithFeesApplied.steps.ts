import { helpWithFeesApplied } from '../functional/page-data/helpWithFeesApplied.page.data';

const { I } = inject();

Given('the citizen is on the Have you already applied for help with fees page', () => {
  I.click(helpWithFeesApplied.elgibleForHealthAndFees);
  I.click(helpWithFeesApplied.saveAndContinueButton);
  I.waitForText(helpWithFeesApplied.pageHeading, 10);
});

Then('the page content is displayed on the Have you already applied for help with fees page', () => {
  I.see(helpWithFeesApplied.pageHeading);
  I.see(helpWithFeesApplied.pageHintText);
  I.see(helpWithFeesApplied.yesOption);
  I.see(helpWithFeesApplied.noOption);
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

Then('the citizen is taken to the Help with fees Check your answers page', () => {
  I.seeInCurrentUrl(helpWithFeesApplied.checkAnswerUrl);
});

Then('the citizen is taken to the You need to apply for help with fees page', () => {
  I.seeInCurrentUrl(helpWithFeesApplied.youNeedToApplyForHelpWithFees);
});
