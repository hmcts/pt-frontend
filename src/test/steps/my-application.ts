import { myApplication } from '../functional/page-data/myapplication.page.data';
import { resolveIdamEmail, resolveIdamPassword } from '../functional/utils/idamPassword';
import { clickButtonOrLink } from '../functional/utils/playwrightActions';

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
