import { yourInformation } from '../functional/page-data/your-information.page.data';

const { I } = inject();

Given('the citizen is on the Your information page', () => {
  I.click(yourInformation.tenancyLink);
  I.see(yourInformation.pageHeading);
});

Then('the page displays the heading {string}', (heading: string) => {
  I.see(heading);
});

Then('the following fields are displayed:', (table: any) => {
  const fields = table.raw().flat();

  fields.forEach((field: any) => {
    I.see(field);
  });
});

Then('the reference number hint text {string} is displayed', (hintText: string) => {
  I.see(hintText);
});

Then('the buttons {string} and {string} are displayed', (button1: string, button2: string) => {
  I.see(button1);
  I.see(button2);
});

Then('the First name field is pre-populated from IDAM', () => {
  I.seeInField(yourInformation.firstNameField, 'John');
});

Then('the First name field remains editable', () => {
  I.fillField(yourInformation.firstNameField, 'UpdatedJohn');
  I.seeInField(yourInformation.firstNameField, 'UpdatedJohn');
});

Then('the Last name field is pre-populated from IDAM', () => {
  I.seeInField(yourInformation.lastNameField, 'Smith');
});

Then('the Last name field remains editable', () => {
  I.fillField(yourInformation.lastNameField, 'UpdatedSmith');
  I.seeInField(yourInformation.lastNameField, 'UpdatedSmith');
});

When('the citizen enters valid values in mandatory fields', () => {
  I.fillField(yourInformation.firstNameField, yourInformation.validFirstName);
  I.fillField(yourInformation.lastNameField, yourInformation.validLastName);
});

When('the citizen enters valid values in mandatory fields only', () => {
  I.fillField(yourInformation.firstNameField, yourInformation.validFirstName);
  I.fillField(yourInformation.lastNameField, yourInformation.validLastName);
});

When('leaves Company name and Reference number blank', () => {
  I.fillField(yourInformation.companyNameField, '');
  I.fillField(yourInformation.referenceNumberField, '');
});

When('the citizen clicks {string}', (button: string) => {
  I.click(button);
});

Then('the details are saved successfully', () => {
  I.dontSee('There is a problem');
});

Then('the citizen is redirected to the {string} page', (pageHeading: string) => {
  I.see(pageHeading);
});

Then('the application accepts the submission', () => {
  I.dontSee('There is a problem');
});

Then('no validation errors are displayed', () => {
  I.dontSeeElement('.govuk-error-summary');
});

When('the citizen enters {string} in First name', (firstName: string) => {
  I.fillField(yourInformation.firstNameField, firstName);
});

When('the citizen enters {string} in Last name', (lastName: string) => {
  I.fillField(yourInformation.lastNameField, lastName);
});

Then('the error message {string} is displayed', (errorMessage: string) => {
  I.see(errorMessage);
  I.seeElement('.govuk-error-summary');
});

Then('the citizen remains on the Your information page', () => {
  I.see(yourInformation.pageHeading);
});
