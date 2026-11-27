import type { Locator, Page } from 'playwright';

const evidenceRowSelector = '.moj-multi-file-upload__row';

export const landlordUploadEvidence = {
  servedNoticeUrlPattern: /\/(served-notice-proposing-new-rent|review-tenancy-details)$/,
  servedNoticeUrlSuffix: 'served-notice-proposing-new-rent',
  servedNoticeQuestion: 'Did you serve the notice proposing a new rent provided in the tenant’s application?',
  servedNoticeYes: (page: Page) =>
    page
      .locator('fieldset')
      .filter({ has: page.locator('legend').getByText(landlordUploadEvidence.servedNoticeQuestion) })
      .getByLabel('Yes', { exact: true }),
  saveAndContinue: (page: Page) => page.getByRole('button', { name: 'Save and continue', exact: true }),
  respondentCasesTab: (page: Page) => page.getByRole('tab', { name: 'Respondent cases', exact: true }),
  respondentCaseRows: (page: Page) => page.locator('#respondent-cases tbody tr'),
  respondentCaseDate: (row: Locator) => row.locator('td').nth(1),
  respondentCaseLink: (row: Locator) => row.getByRole('link'),
  heading: (page: Page, name: string) => page.getByRole('heading', { name, exact: true, level: 1 }),
  link: (page: Page, name: string) => page.getByRole('link', { name, exact: true }),
  upload: (page: Page) => page.locator('[data-module="moj-multi-file-upload"]'),
  evidenceRows: (parent: Page | Locator) => parent.locator(evidenceRowSelector),
  deleteButton: (row: Locator) => row.locator('.moj-multi-file-upload__delete'),
  savedEvidenceRow: (page: Page, fileName: string) =>
    page.locator(evidenceRowSelector).filter({
      has: page.locator('.moj-multi-file-upload__message').getByText(fileName, { exact: true }),
    }),
  fileInput: (page: Page) => page.locator('input[type="file"]'),
  errorSummary: (page: Page) => page.locator('.govuk-error-summary:visible'),
  errorSummaryLink: (summary: Locator, message: string) => summary.getByRole('link', { name: message, exact: true }),
  inlineError: (page: Page) => page.locator('.govuk-error-message:visible'),
};
