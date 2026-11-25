import type { Locator, Page } from 'playwright';

const evidenceRowSelector = '.moj-multi-file-upload__row';

export const landlordUploadEvidence = {
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
