import { ptPreApplication } from '../functional/page-data/ptPreApplication.page.data';

const { I } = inject();

Given('I am on the "Who is named on your tenancy agreement" page', () => {
  I.amOnPage(ptPreApplication.whoisNamedOnTenancyAgreement);
  I.waitForText(ptPreApplication.whoIsNamedOnYourTenancyPageHeader);
});

When('I select the option {string} under {string}', (option: string, question: string) => {
  I.checkOption(option, locate('fieldset').withChild(locate('legend').withText(question)));
});

Then('user is taken back to "Who is named on your tenancy agreement" page', () => {
  I.waitForText(ptPreApplication.whoIsNamedOnYourTenancyPageHeader);
});

Then('user is taken to "You need to use another form to apply" page', () => {
  I.waitForText('You need to use another form to apply');
});
