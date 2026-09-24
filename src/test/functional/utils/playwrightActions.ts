import type { Page } from 'playwright';

export async function fillFieldByLabel(page: Page, label: string, value: string): Promise<void> {
  const genericSelector = label.toLowerCase().includes('password')
    ? 'input[type="password"], input[name="password"]'
    : 'input[type="email"], input[name="email"], input[name="username"], input[type="text"]';

  const candidates = [
    page.getByLabel(label, { exact: true }).first(),
    page.getByRole('textbox', { name: label, exact: true }).first(),
    page.locator(genericSelector).first(),
  ];
  const timeout = 15000;

  const field = await new Promise<(typeof candidates)[number]>((resolve, reject) => {
    let settled = false;
    let pending = candidates.length;
    const notFound = (): void => {
      reject(new Error(`Could not find input for label: ${label}. Current URL: ${page.url()}`));
    };
    const timer = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      notFound();
    }, timeout);

    for (const locator of candidates) {
      locator
        .waitFor({ state: 'visible', timeout })
        .then(() => {
          if (settled) {
            return;
          }
          settled = true;
          clearTimeout(timer);
          resolve(locator);
        })
        .catch(() => {
          pending -= 1;
          if (pending === 0 && !settled) {
            settled = true;
            clearTimeout(timer);
            notFound();
          }
        });
    }
  });

  await field.fill(value);
}

export async function clickButtonOrLink(page: Page, label: string, options?: { waitForLoad?: boolean }): Promise<void> {
  const button = page
    .locator(
      `button:text-is("${label}"),
       [value="${label}"],
       :has-text("${label}") + button,
       :has-text("${label}") ~ button,
       a >> text=${label}`
    )
    .first();

  await button.click();
  if (options?.waitForLoad !== false) {
    await page.waitForLoadState('domcontentloaded');
  }
}
