import { config as testConfig } from '../config';
import { ptApplyingFor } from '../functional/page-data/ptApplyingFor.page.data';
import { youNeedToUseAnotherForm } from '../functional/page-data/ptYouNeedToUseAnotherForm.page.data';
const { I } = inject();

const ptUrl = (path: string): string => new URL(path, testConfig.TEST_URL).toString();
Given('the citizen is on the you need to use another form to apply page', () => {
  I.amOnPage(
    ptUrl('https://pt-frontend-pr-146.preview.platform.hmcts.net/pre-application/applying-for-yourself-or-someone-else')
  );
  I.waitForText(ptApplyingFor.pageHeading);
  I.checkOption(ptApplyingFor.applyingForSomeoneElseOption);
  I.click(ptApplyingFor.continueButton);
});
When('the citizen selects the online application form link', () => {
  I.waitForText(youNeedToUseAnotherForm.pageHeading);
  I.click(youNeedToUseAnotherForm.onlineApplicationFormLink);
});

Then('the citizen is taken to the online application form', () => {
  I.waitInUrl(youNeedToUseAnotherForm.onlineApplicationUrl);
  I.waitForText(youNeedToUseAnotherForm.onlineApplicationFormHeading);
});

When('the citizen selects the downloading the paper form link', () => {
  I.waitForText(youNeedToUseAnotherForm.pageHeading);

  I.click(youNeedToUseAnotherForm.paperFormLink);
});

Then('the citizen is taken to the paper application form', () => {
  I.waitInUrl(youNeedToUseAnotherForm.paperFormUrl);
});

When('the citizen selects the guidance on GOV.UK link', () => {
  I.click(youNeedToUseAnotherForm.guidanceLink);
});

Then('the citizen is taken to the GOV.UK guidance page', () => {
  I.waitInUrl(youNeedToUseAnotherForm.guidanceUrl);
});
