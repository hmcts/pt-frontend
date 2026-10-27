import { accessibilitySkipReason, checkPageAccessibility } from '../functional/utils/accessibilityCheck';

const { I } = inject();

Then('I check the page for accessibility issues', async () => {
  const currentUrl = await I.grabCurrentUrl();
  const skipReason = accessibilitySkipReason(currentUrl);
  if (skipReason) {
    I.say(skipReason);
    return;
  }

  await I.usePlaywrightTo('run axe accessibility check', async ({ page }) => {
    await checkPageAccessibility(page);
  });
});
