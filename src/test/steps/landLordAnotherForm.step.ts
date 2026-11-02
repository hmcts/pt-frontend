import assert from 'assert';

import { config as testConfig } from '../config';
import { ptApplyingFor } from '../functional/page-data/ptApplyingFor.page.data';
import { ptStartingOrReturning } from '../functional/page-data/ptStartingOrReturning.page.data';
import { useAnotherForm } from '../functional/page-data/useAnotherForm.page.data';

const { I } = inject();
const ptUrl = (path: string): string => new URL(path, testConfig.TEST_URL).toString();

type PaperFormResult = { url: string; status: number; contentType: string };
let paperForm: PaperFormResult | undefined;

const linkWithText = (text: string) => locate('a').withText(text);

const openLinkInNewTab = (linkText: string): void => {
  I.waitForText(useAnotherForm.pageHeading);
  I.click(linkWithText(linkText));
  I.waitForNumberOfTabs(2, 10);
  I.switchToNextTab();
};

const seeExternalPageAndClose = (expectedUrl: string, heading?: string): void => {
  const { hostname, pathname } = new URL(expectedUrl);
  I.waitInUrl(hostname, 15);
  if (pathname !== '/') {
    I.waitInUrl(pathname, 15);
  }
  if (heading) {
    I.waitForText(heading, 15);
  }
  I.closeCurrentTab();
};

Given('I have selected Housing association as my landlord', () => {
  I.amOnPage(ptUrl(useAnotherForm.housingAssociationUrl));
  I.waitForText(useAnotherForm.housingAssociationHeading);
  I.checkOption(useAnotherForm.yesOption);
  I.click(useAnotherForm.continueButton);
});

Given('I select apply for some one else option and landed on the you need to use another form to apply page', () => {
  I.amOnPage(ptUrl(ptStartingOrReturning.startingOrReturningUrl));
  I.waitForText(ptStartingOrReturning.pageHeading);
  I.checkOption(ptStartingOrReturning.startingOptionLabel);
  I.click(ptStartingOrReturning.continueButton);

  I.waitForText(ptApplyingFor.pageHeading);
  I.checkOption(ptApplyingFor.applyingForSomeoneElseOption);
  I.click(ptApplyingFor.continueButton);

  I.waitForText(useAnotherForm.pageHeading, 10, 'h1');
});

When('the citizen selects the online application form link', () => {
  openLinkInNewTab(useAnotherForm.onlineFormLink.text);
});

When('the citizen selects the guidance on GOV.UK link', () => {
  openLinkInNewTab(useAnotherForm.guidanceLink.text);
});

When('the citizen selects the downloading the paper form link', async () => {
  I.waitForText(useAnotherForm.pageHeading);
  paperForm = undefined;

  await I.usePlaywrightTo('click the paper form link and verify the PDF', async ({ page }) => {
    const link = page.getByRole('link', { name: useAnotherForm.paperFormLink.text });
    const href = await link.getAttribute('href');
    if (!href) {
      throw new Error('Paper form link has no href');
    }
    const url = new URL(href, page.url()).toString();

    //the browser may open a tab or start a download, so handling both
    const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    await link.click();
    const [popup, download] = await Promise.all([popupPromise, downloadPromise]);
    await download?.cancel();
    if (popup && !popup.isClosed()) {
      await popup.close();
    }

    // Check the PDF itself – same result in headed, headless and Jenkins
    const response = await page.request.get(url, { timeout: 15000 });
    paperForm = {
      url,
      status: response.status(),
      contentType: response.headers()['content-type'] ?? '',
    };
  });
});

Then('the citizen is taken to the online application form', () => {
  seeExternalPageAndClose(useAnotherForm.onlineFormLink.href, useAnotherForm.onlineFormHeading);
});

Then('the citizen is taken to the GOV.UK guidance page', () => {
  seeExternalPageAndClose(useAnotherForm.guidanceLink.href);
});

Then('the citizen is taken to the paper application form', () => {
  assert.ok(paperForm, 'Paper form link was not selected');
  const { url, status, contentType } = paperForm;
  const { downloadUrlPrefix } = useAnotherForm.paperFormLink;

  assert.ok(
    url.startsWith(downloadUrlPrefix) && url.endsWith('.pdf'),
    `Expected paper form PDF under ${downloadUrlPrefix}, got ${url}`
  );
  assert.strictEqual(status, 200, `Paper form returned HTTP ${status}`);
  assert.match(contentType, /application\/pdf/, `Expected a PDF, got "${contentType}"`);
});
