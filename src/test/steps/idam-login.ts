import { config as testConfig } from '../config';
import { idamLogin } from '../functional/page-data/idamLogin.page.data';
import { ptPreApplication } from '../functional/page-data/ptPreApplication.page.data';
import { resolveIdamEmail, resolveIdamPassword } from '../functional/utils/idamPassword';
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

async function waitForPtHost(): Promise<void> {
  const ptHost = new URL(testConfig.TEST_URL).hostname;

  await usePlaywrightPage(async page => {
    await page.waitForURL(
      url => {
        try {
          return new URL(url).hostname === ptHost;
        } catch {
          return false;
        }
      },
      { timeout: testConfig.WaitForTimeout }
    );
  });
}

Given('a user wants to log in to PT', () => {
  // Scenario setup only — navigation happens in the When step.
});

When('they enter the PT UI url', () => {
  // PT AAT currently sends unauthenticated users straight to IDAM.
  I.amOnPage(testConfig.TEST_URL);
});

Then('they are redirected to the IDAM authentication page', async () => {
  I.waitInUrl(idamLogin.idamHost);
  await acceptCookiesIfPresent();
  I.waitForText(idamLogin.signInOrCreateHeading);
});

Given('the user has reached the IDAM authentication page', async () => {
  await openIdamLoginFromPt();
});

When('the user enters their credentials successfully', async () => {
  await submitSignInCredentials(resolveIdamEmail(), resolveIdamPassword());
});

When('the user enters their credentials incorrectly', async () => {
  await submitSignInCredentials(resolveIdamEmail(), 'incorrect-password');
});

Then('the user will be redirected back to the PT UI', async () => {
  await waitForPtHost();
  I.waitForText(idamLogin.postLoginHeading);
  I.waitForText(idamLogin.postLoginServiceName);
  I.waitForText(idamLogin.logoutLink);
});

Then('IDAM will show an error page', () => {
  I.waitInUrl(idamLogin.idamHost);
  I.waitForText(idamLogin.loginErrorHeading);
});
