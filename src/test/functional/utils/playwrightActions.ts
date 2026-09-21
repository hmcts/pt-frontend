import type { Page } from 'playwright';

export async function fillFieldByLabel(page: Page, label: string, value: string): Promise<void> {
  const byLabel = page.getByLabel(label, { exact: true });
  if ((await byLabel.count()) > 0) {
    await byLabel.first().waitFor({ state: 'visible', timeout: 20000 });
    await byLabel.first().fill(value);
    return;
  }

  const roleLocator = page.getByRole('textbox', { name: label, exact: true });
  if ((await roleLocator.count()) > 0) {
    await roleLocator.first().waitFor({ state: 'visible', timeout: 20000 });
    await roleLocator.first().fill(value);
    return;
  }

  const genericLocator = page.locator(
    label.toLowerCase().includes('password')
      ? 'input[type="password"], input[name="password"]'
      : 'input[type="email"], input[name="email"], input[name="username"], input[type="text"]'
  );

  if ((await genericLocator.count()) > 0) {
    await genericLocator.first().waitFor({ state: 'visible', timeout: 20000 });
    await genericLocator.first().fill(value);
    return;
  }

  throw new Error(`Could not find input for label: ${label}`);
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
