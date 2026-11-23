import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { DateTime } from 'luxon';
import { expect } from 'playwright/test';

import { landlordUploadEvidence } from '../functional/page-data/landlordUploadEvidence.page.data';

const { I } = inject();

When('I open the latest respondent case', async () => {
  await I.usePlaywrightTo('open the most recently created respondent case', async ({ page }) => {
    await landlordUploadEvidence.respondentCasesTab(page).click();
    const rows = landlordUploadEvidence.respondentCaseRows(page);
    const count = await rows.count();
    if (count === 0) {
      throw new Error('No respondent cases are available for the test user');
    }

    const cases = await Promise.all(
      Array.from({ length: count }, async (_, index) => {
        const row = rows.nth(index);
        const dateText = (await landlordUploadEvidence.respondentCaseDate(row).innerText()).trim();
        const date = DateTime.fromFormat(dateText, 'dd LLLL yyyy', { locale: 'en-GB' });
        if (!date.isValid) {
          throw new Error(`Cannot determine the creation date of respondent case: "${dateText}"`);
        }
        const link = landlordUploadEvidence.respondentCaseLink(row);
        const reference = (await link.innerText()).trim();
        if (!/^\d+$/.test(reference)) {
          throw new Error(`Invalid respondent case reference: "${reference}"`);
        }
        return { date: date.toMillis(), reference, link };
      })
    );
    cases.sort((a, b) => b.date - a.date || b.reference.localeCompare(a.reference));
    await cases[0].link.click();
  });
});

Then('I should see the heading {string}', async (heading: string) => {
  await I.usePlaywrightTo('check the page heading', async ({ page }) => {
    await expect(landlordUploadEvidence.heading(page, heading)).toBeVisible();
  });
});

Then('I should see the link {string}', async (name: string) => {
  await I.usePlaywrightTo('check the link is visible', async ({ page }) => {
    await expect(landlordUploadEvidence.link(page, name)).toBeVisible();
  });
});

When('I remove all previously uploaded evidence files', async () => {
  await I.usePlaywrightTo('remove previously uploaded evidence', async ({ page }) => {
    const upload = landlordUploadEvidence.upload(page);
    await expect(upload).toBeVisible();
    const rows = landlordUploadEvidence.evidenceRows(upload);
    let remaining = await rows.count();
    while (remaining > 0) {
      await landlordUploadEvidence.deleteButton(rows.first()).click();
      await expect(rows).toHaveCount(remaining - 1, { timeout: 20000 });
      remaining--;
    }
  });
});

Then('no evidence files have been uploaded', async () => {
  await I.usePlaywrightTo('check no evidence files are present', async ({ page }) => {
    await expect(landlordUploadEvidence.evidenceRows(page)).toHaveCount(0);
  });
});

Then('exactly one evidence file should be listed', async () => {
  await I.usePlaywrightTo('check the number of evidence files', async ({ page }) => {
    await expect(landlordUploadEvidence.evidenceRows(page)).toHaveCount(1);
  });
});

Then('the saved evidence file {string} should be listed', async (fileName: string) => {
  await I.usePlaywrightTo('check saved evidence is listed', async ({ page }) => {
    const row = landlordUploadEvidence.savedEvidenceRow(page, fileName);
    await expect(row).toBeVisible();
  });
});

When('I reload the evidence page', async () => {
  await I.usePlaywrightTo('reload the evidence page', async ({ page }) => {
    await page.reload({ waitUntil: 'domcontentloaded' });
  });
});

Then('no upload error summary should be displayed', async () => {
  await I.usePlaywrightTo('check the upload error summary is absent', async ({ page }) => {
    await expect(landlordUploadEvidence.errorSummary(page)).toHaveCount(0);
  });
});

When('I select the invalid evidence file {string}', async (fileName: string) => {
  await I.usePlaywrightTo('select invalid evidence', async ({ page }) => {
    const input = landlordUploadEvidence.fileInput(page);
    if (fileName === 'empty.pdf') {
      await input.setInputFiles(path.resolve(process.cwd(), 'src/test/data', fileName));
    } else if (fileName === 'evidence.exe') {
      await input.setInputFiles({ name: fileName, mimeType: 'application/octet-stream', buffer: Buffer.from('test') });
    } else {
      throw new Error(`Unknown invalid evidence file: "${fileName}"`);
    }
  });
});

When('I select a valid PDF and an unsupported file together', async () => {
  await I.usePlaywrightTo('select a mixed evidence batch', async ({ page }) => {
    const pdf = await readFile(path.resolve(process.cwd(), 'src/test/data/test-pdf.pdf'));
    await landlordUploadEvidence.fileInput(page).setInputFiles([
      { name: 'test-pdf.pdf', mimeType: 'application/pdf', buffer: pdf },
      { name: 'evidence.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('test') },
    ]);
  });
});

Then('the upload error summary and inline error should display {string}', async (message: string) => {
  await I.usePlaywrightTo('check the upload validation errors', async ({ page }) => {
    const input = landlordUploadEvidence.fileInput(page);
    const inputId = await input.getAttribute('id');
    if (!inputId) {
      throw new Error('The evidence upload input has no id');
    }
    const summary = landlordUploadEvidence.errorSummary(page);
    await expect(landlordUploadEvidence.errorSummaryLink(summary, message)).toHaveAttribute('href', `#${inputId}`);
    await expect(landlordUploadEvidence.inlineError(page)).toContainText(message);
    await expect(input).toHaveAccessibleDescription(new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
});
