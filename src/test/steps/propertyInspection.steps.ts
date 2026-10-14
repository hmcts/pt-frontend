import { propertyInspection } from '../functional/page-data/propertyInspection.page.data';

const { I } = inject();

/**
11
* Page Load
12
*/
Given('the citizen is on the Property Inspection page', () => {
  I.click(propertyInspection.inspectionHearingLink);
  I.waitForText(propertyInspection.pageHeading, 10);
  I.waitForText(propertyInspection.pageHeadingSubText);
  I.waitForText(propertyInspection.pageHeadingSubText1);
  I.waitForText(propertyInspection.pageHeadingSubText2);
});

Then('the Property Inspection page content is displayed', () => {
  I.see(propertyInspection.pageHeading, 'h1');
  I.see(propertyInspection.question);
  I.see(propertyInspection.yesOption);
  I.see(propertyInspection.noOption);
  I.see(propertyInspection.saveAndContinueButton);
  I.see(propertyInspection.saveForLaterButton);
});

/**
31
* AC2 - Conditional Reveal
32
*/

When('the citizen selects No on the Property Inspection page', () => {
  I.checkOption(propertyInspection.noOption);
});

Then('the inspection reason field is revealed', () => {
  I.see(propertyInspection.inspectionReasonLabel);
  I.see(propertyInspection.inspectionReasonHint);
  I.seeElement('textarea');
});

Then('the inspection reason field is mandatory', () => {
  I.click(propertyInspection.saveAndContinueButton);
  I.seeElement(propertyInspection.errorSummarySelector);
  I.see(propertyInspection.inspectionReasonError);
});
/**
54
* AC3 - Save and Continue with Yes
55
*/
When('the citizen selects Yes on the Property Inspection page', () => {
  I.checkOption(propertyInspection.yesOption);
});

When('the citizen clicks Save and continue on the Property Inspection page', () => {
  I.click(propertyInspection.saveAndContinueButton);
});

Then('the citizen is taken to the Hearing page', () => {
  I.waitForText(propertyInspection.hearingPageHeading, 10);
});

/**
69
* AC3 - Save and Continue with No and reason
70
*/
When('the citizen enters an inspection reason', () => {
  I.fillField(propertyInspection.inspectionReasonLabel, propertyInspection.inspectionReason);
});

/**
79
* AC5 - Validation
80
*/
When('the citizen submits the Property Inspection page without selecting an option', () => {
  I.click(propertyInspection.saveAndContinueButton);
});

Then('the property inspection radio button error is displayed', () => {
  I.seeElement(propertyInspection.errorSummarySelector);
  I.see(propertyInspection.radioButtonError, propertyInspection.errorSummarySelector);
  I.see(propertyInspection.radioButtonError);
});

When('the citizen selects No and leaves the inspection reason blank', () => {
  I.checkOption(propertyInspection.noOption);
  I.click(propertyInspection.saveAndContinueButton);
});
Then('the inspection reason validation error is displayed', () => {
  I.seeElement(propertyInspection.errorSummarySelector);
  I.see(propertyInspection.inspectionReasonError, propertyInspection.errorSummarySelector);
  I.see(propertyInspection.inspectionReasonError);
});
Then('the citizen remains on the Property Inspection page', () => {
  I.seeInCurrentUrl(propertyInspection.url);
});
