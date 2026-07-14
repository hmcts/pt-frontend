import { config as testConfig } from '../config';
import { idamLogin } from '../functional/page-data/idamLogin.page.data';
import { ptPreApplication } from '../functional/page-data/ptPreApplication.page.data';
import { resolveIdamPassword } from '../functional/utils/idamPassword';
import { clickButtonOrLink, fillFieldByLabel } from '../functional/utils/playwrightActions';

const { I } = inject();

const ptUrl = (path: string): string => new URL(path, testConfig.TEST_URL).toString();

async function usePlaywrightPage(action: (page: import('playwright').Page) => Promise<void>): Promise<void> {
  await I.usePlaywrightTo('run playwright action', async ({ page }) => action(page));
}

async function acceptCookiesIfPresent(): Promise<void> {
  await usePlaywrightPage(async page => {
    const acceptCookies = page.getByRole('button', { name: idamLogin.acceptAdditionalCookiesButton });
    if ((await acceptCookies.count()) > 0) {
      await acceptCookies.click();
    }
  });
}

async function openIdamLoginFromPt(): Promise<void> {
  I.amOnPage(ptUrl(ptPreApplication.startingOrReturningUrl));
  I.waitForText(ptPreApplication.startingOrReturningHeading);
  I.checkOption(ptPreApplication.returningOptionLabel);
  I.click(ptPreApplication.continueButton);
  I.waitInUrl(idamLogin.idamHost);
  I.waitForText(idamLogin.signInOrCreateHeading);
  await acceptCookiesIfPresent();
}

async function ensureSignInFormVisible(): Promise<void> {
  await usePlaywrightPage(async page => {
    const emailField = page.getByRole('textbox', { name: idamLogin.emailAddressLabel, exact: true });
    if ((await emailField.count()) === 0) {
      await clickButtonOrLink(page, idamLogin.signInButton);
      await emailField.first().waitFor({ state: 'visible' });
    }
  });
}

async function submitSignInCredentials(email: string, password: string): Promise<void> {
  await ensureSignInFormVisible();

  await usePlaywrightPage(async page => {
    await fillFieldByLabel(page, idamLogin.emailAddressLabel, email);
    await fillFieldByLabel(page, idamLogin.passwordLabel, password);
    await clickButtonOrLink(page, idamLogin.signInButton);
  });
}

Given('a user wants to log in to PT', () => {
  // Scenario setup only — navigation happens in the When step.
});

When('they enter the PT UI url {string}', async (url: string) => {
  I.amOnPage(url);
  I.waitForText(idamLogin.propertyTribunalHeading);
  await openIdamLoginFromPt();
});

Then('they are redirected to the IDAM authentication page', () => {
  I.waitInUrl(idamLogin.idamHost);
  I.waitForText(idamLogin.signInOrCreateHeading);
});

Given('the user has reached the IDAM authentication page', async () => {
  await openIdamLoginFromPt();
});

When('the user enters their credentials successfully as {string}', async (email: string) => {
  await submitSignInCredentials(email, resolveIdamPassword());
});

When('the user enters their credentials incorrectly as {string}', async (email: string) => {
  await submitSignInCredentials(email, 'incorrect-password');
});

Then('the user will be redirected back to the PT UI', () => {
  I.waitInUrl(idamLogin.ptHost);
  I.waitForText(idamLogin.propertyTribunalHeading);
});

Then('IDAM will show an error page', () => {
  I.waitInUrl(idamLogin.idamHost);
  I.waitForText(idamLogin.loginErrorHeading);
});
