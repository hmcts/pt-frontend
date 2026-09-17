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

function isPtHost(url: string): boolean {
  return new URL(url).hostname === new URL(testConfig.TEST_URL).hostname;
}

async function waitForPtRedirect(page: import('playwright').Page): Promise<void> {
  const ptHost = new URL(testConfig.TEST_URL).hostname;

  try {
    await page.waitForURL(url => isPtHost(url.toString()), {
      timeout: testConfig.LoginRedirectTimeout,
      waitUntil: 'domcontentloaded',
    });
  } catch (error) {
    const wrapped = new Error(
      `Timed out waiting for redirect to PT (${ptHost}) after IDAM sign-in. Current URL: ${page.url()}`
    ) as Error & { cause?: unknown };
    wrapped.cause = error;
    throw wrapped;
  }
}

async function submitSignInCredentials(
  email: string,
  password: string,
  options?: { waitForPtRedirect?: boolean }
): Promise<void> {
  await ensureSignInFormVisible();
  await acceptCookiesIfPresent();

  await usePlaywrightPage(async page => {
    await fillFieldByLabel(page, idamLogin.emailAddressLabel, email);
    await fillFieldByLabel(page, idamLogin.passwordLabel, password);

    if (options?.waitForPtRedirect) {
      // Start waiting before the click so a fast OAuth redirect is not missed.
      const redirected = waitForPtRedirect(page);
      await clickButtonOrLink(page, idamLogin.signInButton, { waitForLoad: false });
      await redirected;
      return;
    }

    await clickButtonOrLink(page, idamLogin.signInButton);
  });
}

async function waitForPtHost(): Promise<void> {
  await usePlaywrightPage(async page => {
    if (isPtHost(page.url())) {
      return;
    }
    await waitForPtRedirect(page);
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
  await submitSignInCredentials(resolveIdamEmail(), resolveIdamPassword(), { waitForPtRedirect: true });
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
