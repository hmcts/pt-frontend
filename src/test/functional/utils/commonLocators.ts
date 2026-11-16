import type { Page } from 'playwright';

import { commonPage } from '../page-data/common.page.data';

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const exactText = (text: string) => new RegExp(`^\\s*${escapeRegex(text)}\\s*$`);

export const summaryRow = (page: Page, question: string) =>
  page
    .getByRole('term')
    .filter({ hasText: exactText(question) })
    .locator('..');

export const summaryAnswer = (page: Page, question: string) =>
  summaryRow(page, question).getByRole('definition').first(); // 1st <dd> = answer, 2nd = actions

export const changeLink = (page: Page, question: string) =>
  summaryRow(page, question).getByRole('link', { name: new RegExp(`^${commonPage.changeLinkLabel}\\b`) });

export const errorSummary = (page: Page) =>
  page.getByRole('alert').filter({
    has: page.getByRole('heading', { name: commonPage.errorSummaryTitle, exact: true }),
  });

export const errorSummaryLink = (page: Page, errorMessage: string) =>
  errorSummary(page).getByRole('link', { name: errorMessage, exact: true });
