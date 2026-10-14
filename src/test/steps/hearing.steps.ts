import { hearing } from '../functional/page-data/hearing.page.data';
import { propertyInspection } from '../functional/page-data/propertyInspection.page.data';

const { I } = inject();

Given('the citizen is on the Hearing page', () => {
  I.click(propertyInspection.inspectionHearingLink);
  I.waitForText(propertyInspection.pageHeading, 10);
  I.checkOption(propertyInspection.yesOption);
  I.click(propertyInspection.saveAndContinueButton);
  I.waitForText(hearing.pageHeading, 10);
});

Then('the hearing page content is displayed correctly', () => {
  I.see(hearing.pageHeading);
  I.see(hearing.pageHeadingText);
  I.see(hearing.pageHeadingText1);
  I.see(hearing.pageHeadingText2);
  I.see(hearing.hearingQuestion);
  I.see(hearing.yesOption);
  I.see(hearing.noOption);
  I.see(hearing.saveAndContinueButton);
  I.see(hearing.saveForLaterButton);
});

When('the citizen selects Yes on the hearing page', () => {
  I.click(hearing.yesOption);
});

When('the citizen selects No on the hearing page', () => {
  I.click(hearing.noOption);
});

Then('the hearing reason text area is displayed', () => {
  I.see(hearing.reasonLabel);
});

When('the citizen enters a hearing reason', () => {
  I.fillField(hearing.reasonLabel, hearing.hearingReason);
});

When('the citizen clicks hearing Save and continue', () => {
  I.click(hearing.saveAndContinueButton);
});

Then('the citizen is taken to the Check your answers page', () => {
  I.waitForText(hearing.checkAnswersHeading);
});

Then('the citizen sees the hearing selection validation error', () => {
  I.seeElement(hearing.errorSummarySelector);
  I.see(hearing.hearingSelectionError);
});

Then('the citizen sees the hearing reason validation error', () => {
  I.seeElement(hearing.errorSummarySelector);
  I.see(hearing.hearingReasonError);
});
