import { myApplication } from '../functional/page-data/myapplication.page.data';
import { resolveIdamEmail, resolveIdamPassword } from '../functional/utils/idamPassword';
import { clickButtonOrLink } from '../functional/utils/playwrightActions';

import { selectOptionByLabel } from './common';
import { submitSignInCredentials, verifyRedirectedToPtUI } from './idam-login';

const { I } = inject();

async function usePlaywrightPage(action: (page: import('playwright').Page) => Promise<void>): Promise<void> {
  await I.usePlaywrightTo('run playwright action', async ({ page }) => action(page));
}

async function clickMyApplicationsLink(): Promise<void> {
  await usePlaywrightPage(async page => {
    await clickButtonOrLink(page, myApplication.startNewApplicationLinkText);
  });
}

Given('the user has successfully logged on to market-rent-determination application', async () => {
  await submitSignInCredentials(resolveIdamEmail(), resolveIdamPassword());
  await verifyRedirectedToPtUI();
});

Then('check that the user is redirected to the my-application page', async () => {
  I.waitForText(myApplication.myApplicationPageHeading);
});

When('user clicks on the my application link', async () => {
  await clickMyApplicationsLink();
});

Then('check that the user is redirected to the application-type page', () => {
  I.waitInUrl(myApplication.startNewApplicationUrl);
  I.waitForText(myApplication.applicationTypeHeading);
});

Then('check that the user is redirected to the "tenancy-type" page', () => {
  I.waitInUrl(myApplication.tenancyTypeUrl);
  I.waitForText(myApplication.tenancyTypeHeading);
});

Then('I check that valid error message is displayed for the tenancy-type page', () => {
  I.waitForText(myApplication.tenancyTypeErrorMessage);
});

Then('check that the user is redirected to the task-list citizen dashboard page', () => {
  I.waitInUrl(myApplication.taskListUrl);
  I.waitForText(myApplication.taskListHeading);
});

When('I select the option "Challenge the rent increase proposed in a landlord’s notice"', async () => {
  selectOptionByLabel(myApplication.challengeRentIncreaseOption);
});

When('I select the option "Assured periodic tenancy"', async () => {
  selectOptionByLabel(myApplication.assuredPeriodicTenancyOption);
});

When('I select the option {string}', async (option: string) => {
  selectOptionByLabel(option);
});
