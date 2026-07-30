import { config as testConfig } from '../config';
import { ptApplyingFor } from '../functional/page-data/ptApplyingFor.page.data';
import { ptStartingOrReturning } from '../functional/page-data/ptStartingOrReturning.page.data';
import { youNeedToUseAnotherForm } from '../functional/page-data/ptYouNeedToUseAnotherForm.page.data';
const { I } = inject();

const ptUrl = (path: string): string => new URL(path, testConfig.TEST_URL).toString();

async function usePlaywrightPage(action: (page: import('playwright').Page) => Promise<void>): Promise<void> {
  await I.usePlaywrightTo('run playwright action', async ({ page }) => action(page));
}

let paperFormDownloadUrl: string | undefined;

Given('the citizen is on the you need to use another form to apply page', () => {
  I.amOnPage(ptUrl(ptStartingOrReturning.startingOrReturningUrl));
  I.waitForText(ptStartingOrReturning.pageHeading);
  I.checkOption(ptStartingOrReturning.startingOptionLabel);
  I.click(ptStartingOrReturning.continueButton);

  I.waitForText(ptApplyingFor.pageHeading);
  I.checkOption(ptApplyingFor.applyingForSomeoneElseOption);
  I.click(ptApplyingFor.continueButton);

  I.waitForText(youNeedToUseAnotherForm.pageHeading);
});

When('the citizen selects the online application form link', () => {
  I.waitForText(youNeedToUseAnotherForm.pageHeading);
  I.click(youNeedToUseAnotherForm.onlineApplicationFormLink);
  I.waitForNumberOfTabs(2, 10);
  I.switchToNextTab();
});

Then('the citizen is taken to the online application form', () => {
  I.waitInUrl(youNeedToUseAnotherForm.onlineApplicationUrl);
  I.waitForText(youNeedToUseAnotherForm.onlineApplicationFormHeading);
});

When('the citizen selects the downloading the paper form link', async () => {
  I.waitForText(youNeedToUseAnotherForm.pageHeading);
  paperFormDownloadUrl = undefined;

  await usePlaywrightPage(async page => {
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await page.getByRole('link', { name: youNeedToUseAnotherForm.paperFormLink }).click();
    const download = await downloadPromise;
    paperFormDownloadUrl = download.url();
  });
});

Then('the citizen is taken to the paper application form', () => {
  if (!paperFormDownloadUrl?.includes(youNeedToUseAnotherForm.paperFormUrl)) {
    throw new Error(
      `Expected paper form at ${youNeedToUseAnotherForm.paperFormUrl}, got ${paperFormDownloadUrl ?? 'no download'}`
    );
  }
});

When('the citizen selects the guidance on GOV.UK link', () => {
  I.click(youNeedToUseAnotherForm.guidanceLink);
  I.waitForNumberOfTabs(2, 10);
  I.switchToNextTab();
});

Then('the citizen is taken to the GOV.UK guidance page', () => {
  I.waitInUrl(youNeedToUseAnotherForm.guidanceUrl);
});
