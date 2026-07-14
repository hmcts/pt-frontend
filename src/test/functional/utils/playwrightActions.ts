import type { Page } from 'playwright';

export async function fillFieldByLabel(page: Page, label: string, value: string): Promise<void> {
  const roleLocator = page.getByRole('textbox', { name: label, exact: true });

  if ((await roleLocator.count()) > 0) {
    await roleLocator.first().fill(value);
    return;
  }

  await page
    .locator(
      `
      :has-text("${label}") ~ input:visible:enabled,
      label:text-is("${label}") ~ textarea,
      label:text-is("${label}") + div input,
      :text-is("${label}") ~ textarea:visible:enabled
    `
    )
    .first()
    .fill(value);
}

export async function clickButtonOrLink(page: Page, label: string): Promise<void> {
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
  await page.waitForLoadState('domcontentloaded');
}
