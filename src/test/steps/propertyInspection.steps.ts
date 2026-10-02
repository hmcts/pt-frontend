import { propertyInspection } from '../functional/page-data/propertyInspection.page.data';

const { I } = inject();

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

Then('the inspection reason field is revealed', () => {
  I.see(propertyInspection.inspectionReasonLabel);
  I.see(propertyInspection.inspectionReasonHint);
  I.seeElement('textarea');
});

Then('the citizen is taken to the Hearing page', () => {
  I.waitForText(propertyInspection.hearingPageHeading, 10);
});

When('the citizen enters an inspection reason', () => {
  I.fillField(propertyInspection.inspectionReasonLabel, propertyInspection.inspectionReason);
});

When('the citizen submits the Property Inspection page without selecting an option', () => {
  I.click(propertyInspection.saveAndContinueButton);
});

When('the citizen selects No and leaves the inspection reason blank', () => {
  I.checkOption(propertyInspection.noOption);
  I.click(propertyInspection.saveAndContinueButton);
});

Then('the citizen remains on the Property Inspection page', () => {
  I.seeInCurrentUrl(propertyInspection.url);
});
