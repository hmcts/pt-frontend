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

export async function verifyRedirectedToPtUI(): Promise<void> {
  await usePlaywrightPage(async page => {
    await page
      .getByRole('heading', {
        name: /My applications/i,
      })
      .waitFor({ state: 'visible', timeout: 30000 });

    await page
      .getByRole('link', {
        name: /Start a new application/i,
      })
      .waitFor({ state: 'visible', timeout: 30000 });
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

function buildIdamLoginUrl(): string {
  const idamLoginUrl = new URL('/login', 'https://idam-web-public.aat.platform.hmcts.net');
  idamLoginUrl.searchParams.set('client_id', 'pt-frontend');
  idamLoginUrl.searchParams.set('response_type', 'code');
  idamLoginUrl.searchParams.set('redirect_uri', new URL('/oauth2/callback', testConfig.TEST_URL).toString());
  return idamLoginUrl.toString();
}

async function dismissCookieBanner(page: import('playwright').Page): Promise<void> {
  const acceptCookies = page.getByRole('button', { name: idamLogin.acceptAdditionalCookiesButton });
  if ((await acceptCookies.count()) === 0) {
    return;
  }

  const button = acceptCookies.first();
  if (!(await button.isVisible())) {
    return;
  }

  await button.click();
}

// An existing IDAM session shows the sign-in form and then redirects back to PT.
// Treat that redirect as already signed in, instead of filling a form that has gone.
async function resolveSignInTarget(page: import('playwright').Page): Promise<'form' | 'pt'> {
  if (isPtHost(page.url())) {
    return 'pt';
  }

  if (!page.url().includes(idamLogin.idamHost)) {
    await page.goto(buildIdamLoginUrl(), { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (isPtHost(page.url())) {
      return 'pt';
    }
  }

  await dismissCookieBanner(page);
  if (isPtHost(page.url())) {
    return 'pt';
  }

  const timeout = 30000;
  const emailField = page.getByRole('textbox', { name: idamLogin.emailAddressLabel, exact: true });

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (result: 'form' | 'pt' | Error): void => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      if (result instanceof Error) {
        reject(result);
        return;
      }
      resolve(result);
    };

    const timer = setTimeout(() => {
      finish(
        isPtHost(page.url())
          ? 'pt'
          : new Error(`Timed out waiting for the IDAM sign-in form. Current URL: ${page.url()}`)
      );
    }, timeout);

    emailField
      .waitFor({ state: 'visible', timeout })
      .then(() => finish(isPtHost(page.url()) ? 'pt' : 'form'))
      .catch(() => undefined);

    page
      .waitForURL(url => isPtHost(url.toString()), { timeout, waitUntil: 'commit' })
      .then(() => finish('pt'))
      .catch(() => undefined);
  });
}

function isPtHost(url: string): boolean {
  return new URL(url).hostname === new URL(testConfig.TEST_URL).hostname;
}

async function waitForPtRedirect(page: import('playwright').Page): Promise<void> {
  const ptHost = new URL(testConfig.TEST_URL).hostname;

  if (isPtHost(page.url())) {
    return;
  }

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

async function fillSignInForm(
  page: import('playwright').Page,
  email: string,
  password: string
): Promise<'filled' | 'pt'> {
  if (isPtHost(page.url())) {
    return 'pt';
  }

  try {
    await fillFieldByLabel(page, idamLogin.emailAddressLabel, email);
    if (isPtHost(page.url())) {
      return 'pt';
    }
    await fillFieldByLabel(page, idamLogin.passwordLabel, password);
  } catch (error) {
    if (isPtHost(page.url())) {
      return 'pt';
    }
    throw error;
  }

  return isPtHost(page.url()) ? 'pt' : 'filled';
}

export async function submitSignInCredentials(
  email: string,
  password: string,
  options?: { waitForPtRedirect?: boolean }
): Promise<void> {
  await usePlaywrightPage(async page => {
    const target = await resolveSignInTarget(page);

    if (target === 'pt') {
      if (options?.waitForPtRedirect) {
        return;
      }
      throw new Error(`IDAM sign-in form was not available because the browser is already on PT (${page.url()}).`);
    }

    const filled = await fillSignInForm(page, email, password);
    if (filled === 'pt') {
      if (options?.waitForPtRedirect) {
        return;
      }
      throw new Error(`IDAM sign-in form disappeared before credentials could be entered. Current URL: ${page.url()}`);
    }

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

Given('the user navigates to PT url', () => {
  // PT AAT currently sends unauthenticated users straight to IDAM.
  I.amOnPage(testConfig.TEST_URL);
  I.waitInUrl(idamLogin.idamHost);
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

Then('user is taken to the IDAM login page', async () => {
  I.waitInUrl(idamLogin.idamHost);
  await acceptCookiesIfPresent();
  I.waitForText(idamLogin.signInOrCreateHeading);
});
