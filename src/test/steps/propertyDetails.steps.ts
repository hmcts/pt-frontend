import path from 'node:path';

import { propertyDetails } from '../functional/page-data/propertyDetails.page.data';

const { I } = inject();

Then('check that the user is redirected to the property-details page', () => {
  I.waitInUrl(propertyDetails.propertyDetailsUrl);
  I.waitForText(propertyDetails.propertyDetailsHeading);
});

When('I enter first line of address as {string}', (addressLine1: string) => {
  I.fillField('Address line 1', addressLine1);
});

When('I enter second line of address as {string}', (addressLine2: string) => {
  I.fillField('Address line 2 (optional)', addressLine2);
});

When('I enter town or city as {string}', (townOrCity: string) => {
  I.fillField('Town or city', townOrCity);
});

When('I enter postcode as {string}', (postcode: string) => {
  I.fillField('Postcode', postcode);
});

When('I enter room sizes as {string} for the question {string}', (roomSizes: string, question: string) => {
  I.fillField(question, roomSizes);
});

Then('the page should display the text {string}', (text: string) => {
  I.waitForText(text);
});

When('I click on the {string} button and upload a file {string}',async (buttonText: string, fileName: string) => {
    await I.usePlaywrightTo('upload a property photo', async ({ page }) => {
      const filePath = path.resolve(process.cwd(),'src/test/test-data', fileName);

      await page.getByLabel(propertyDetails.uploadFileInputLabel, { exact: true }).setInputFiles(filePath);

      await page
        .locator(propertyDetails.uploadedFileSuccessSelector)
        .filter({ hasText: fileName })
        .waitFor({
          state: 'visible',
          timeout: 60000,
        });
    });
  },
);

When('I select the file {string} for upload', async (fileName: string) => {
  await I.usePlaywrightTo('select file for upload validation', async ({ page }) => {
    const filePath = path.resolve(process.cwd(), 'src/test/test-data', fileName);
    await page.getByLabel(propertyDetails.uploadFileInputLabel, { exact: true }).setInputFiles(filePath);
  });
});

When('I select {int} files from {string} for upload', async (fileCount: number, fileName: string) => {
  await I.usePlaywrightTo('select multiple property photo files', async ({ page }) => {
    const filePath = path.resolve(process.cwd(), 'src/test/test-data', fileName);
    await page
      .getByLabel(propertyDetails.uploadFileInputLabel, { exact: true })
      .setInputFiles(Array.from({ length: fileCount }, () => filePath));
  });
});

When('I upload files {string} in parallel', async (fileNames: string) => {
  await I.usePlaywrightTo('select property photos for parallel upload', async ({ page }) => {
    const filePaths = fileNames
      .split(',')
      .map(fileName => path.resolve(process.cwd(), 'src/test/test-data', fileName.trim()));
    await page.getByLabel(propertyDetails.uploadFileInputLabel, { exact: true }).setInputFiles(filePaths);
  });
});

Then('I check that file name {string} is displayed on the page with green tick mark', async (fileName: string) => {
  await I.usePlaywrightTo('check uploaded file success indicator', async ({ page }) => {
    await page
      .locator(propertyDetails.uploadedFileSuccessSelector)
      .filter({ hasText: fileName })
      .waitFor({ state: 'visible', timeout: 180000 });
  });
});

Then('I check that {string} button is displayed on the page', async (buttonText: string) => {
  await I.usePlaywrightTo('check upload action button is visible', async ({ page }) => {
    await page
      .locator(propertyDetails.uploadedFileDeleteButtonSelector)
      .filter({ hasText: buttonText })
      .waitFor({ state: 'visible' });
  });
});

When('I click on the {string} button', async (buttonText: string) => {
  await I.usePlaywrightTo('click upload action button', async ({ page }) => {
    await page.locator(propertyDetails.uploadedFileDeleteButtonSelector).filter({ hasText: buttonText }).click();
  });
});

Then('I check that file name {string} is not displayed on the page', async (fileName: string) => {
  await I.usePlaywrightTo('check uploaded file is removed', async ({ page }) => {
    await page
      .locator(propertyDetails.uploadedFileSuccessSelector)
      .filter({ hasText: fileName })
      .waitFor({ state: 'hidden' });
  });
});
