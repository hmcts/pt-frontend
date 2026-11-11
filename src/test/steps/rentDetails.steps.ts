import { rentDetails } from '../functional/page-data/rentDetails.page.data';

const { I } = inject();

When('I enter tribunal case reference number as {string}', (caseReference: string) => {
  I.fillField(
    "What was the tribunal's case reference number for the previous determination? (optional)",
    caseReference
  );
});

When('I enter {string} for {string} rent amount', (amount: string, frequency: string) => {
  I.fillField(`How much is the current ${frequency.toLowerCase()} rent?`, amount);
});

When('I enter {string} for {string} council tax amount', (amount: string, frequency: string) => {
  I.fillField(`How much does council tax cost ${frequency.toLowerCase()}? (optional)`, amount);
});

Then('rent frequency options should appear in order', async () => {
  await I.usePlaywrightTo('check rent frequency option order', async ({ page }) => {
    const fieldset = page.locator(rentDetails.radioFieldsetSelector).filter({
      has: page
        .locator(rentDetails.radioGroupLegendSelector)
        .getByText(rentDetails.rentFrequencyQuestion, { exact: true }),
    });
    const labels = await fieldset
      .locator(rentDetails.radioSelector)
      .evaluateAll((inputs: Element[]) =>
        inputs.map(input => (input as HTMLInputElement).labels?.[0]?.textContent?.trim() ?? '')
      );
    if (JSON.stringify(labels) !== JSON.stringify(rentDetails.rentFrequencyOptions)) {
      throw new Error(
        `Expected rent frequencies in order ${rentDetails.rentFrequencyOptions.join(', ')}, got ${labels.join(', ')}`
      );
    }
  });
});

Then('the rent amount field {string} should display a pound prefix', async (fieldLabel: string) => {
  await I.usePlaywrightTo('check rent amount currency prefix', async ({ page }) => {
    const field = page.getByLabel(fieldLabel, { exact: true });
    await field.waitFor({ state: 'visible' });
    const inputWrapper = field.locator('xpath=..');
    await inputWrapper
      .locator(rentDetails.amountPrefixSelector)
      .getByText(rentDetails.currencySymbol, { exact: true })
      .waitFor({ state: 'visible' });
  });
});

Then('original tenancy options should appear in order', async () => {
  await I.usePlaywrightTo('check original tenancy options order', async ({ page }) => {
    const group = page.getByRole('group', {
      name: rentDetails.currentTenancyReplaceOriginalTenancyQuestion,
      exact: true,
    });
    const labels = await group
      .getByRole('radio')
      .evaluateAll((radios: Element[]) =>
        radios.map(radio => (radio as HTMLInputElement).labels?.[0]?.textContent?.trim() ?? '')
      );
    if (JSON.stringify(labels) !== JSON.stringify(rentDetails.currentTenancyReplaceOriginalTenancyOptions)) {
      throw new Error(`Unexpected original tenancy options: ${labels.join(', ')}`);
    }
  });
});

Then('original tenancy date parts should be visible', async () => {
  await I.usePlaywrightTo('check original tenancy date inputs', async ({ page }) => {
    const group = page.getByRole('group', {
      name: rentDetails.originalTenancyStartDateQuestion,
      exact: true,
    });
    for (const part of rentDetails.originalTenancyDateParts) {
      await group.getByLabel(part, { exact: true }).waitFor({ state: 'visible' });
    }
  });
});

Then('the original tenancy date field should not be displayed', async () => {
  await I.usePlaywrightTo('check original tenancy date is hidden', async ({ page }) => {
    await page.getByText(rentDetails.originalTenancyStartDateQuestion, { exact: true }).waitFor({ state: 'hidden' });
  });
});

When(
  'I enter date parts {string}, {string}, and {string} for original tenancy',
  async (day: string, month: string, year: string) => {
    await I.usePlaywrightTo('enter original tenancy date parts', async ({ page }) => {
      const group = page.getByRole('group', {
        name: rentDetails.originalTenancyStartDateQuestion,
        exact: true,
      });
      await group.getByLabel('Day', { exact: true }).fill(day);
      await group.getByLabel('Month', { exact: true }).fill(month);
      await group.getByLabel('Year', { exact: true }).fill(year);
    });
  }
);

Then('the original tenancy date should be {string}', async (date: string) => {
  const [day, month, year] = date.split('/');
  await I.usePlaywrightTo('check saved original tenancy date', async ({ page }) => {
    const group = page.getByRole('group', {
      name: rentDetails.originalTenancyStartDateQuestion,
      exact: true,
    });
    for (const [part, expected] of [
      ['Day', day],
      ['Month', month],
      ['Year', year],
    ]) {
      const value = await group.getByLabel(part, { exact: true }).inputValue();
      if (value !== expected) {
        throw new Error(`Expected original tenancy ${part.toLowerCase()} ${expected}, got ${value}`);
      }
    }
  });
});

Then('tenancy end date parts should be visible', async () => {
  await I.usePlaywrightTo('check tenancy end date inputs', async ({ page }) => {
    const group = page.getByRole('group', { name: rentDetails.tenancyEndDateQuestion, exact: true });
    for (const part of rentDetails.tenancyEndDateParts) {
      await group.getByLabel(part, { exact: true }).waitFor({ state: 'visible' });
    }
  });
});

When(
  'I enter date parts {string}, {string}, and {string} for tenancy end date',
  async (day: string, month: string, year: string) => {
    await I.usePlaywrightTo('enter tenancy end date parts', async ({ page }) => {
      const group = page.getByRole('group', { name: rentDetails.tenancyEndDateQuestion, exact: true });
      await group.getByLabel('Day', { exact: true }).fill(day);
      await group.getByLabel('Month', { exact: true }).fill(month);
      await group.getByLabel('Year', { exact: true }).fill(year);
    });
  }
);

Then('the tenancy end date should be {string}', async (date: string) => {
  const [day, month, year] = date.split('/');
  await I.usePlaywrightTo('check saved tenancy end date', async ({ page }) => {
    const group = page.getByRole('group', { name: rentDetails.tenancyEndDateQuestion, exact: true });
    for (const [part, expected] of [
      ['Day', day],
      ['Month', month],
      ['Year', year],
    ]) {
      const value = await group.getByLabel(part, { exact: true }).inputValue();
      if (value !== expected) {
        throw new Error(`Expected tenancy end ${part.toLowerCase()} ${expected}, got ${value}`);
      }
    }
  });
});

Then('the tenancy end date fields should be empty', async () => {
  await I.usePlaywrightTo('check tenancy end date was not saved', async ({ page }) => {
    const group = page.getByRole('group', { name: rentDetails.tenancyEndDateQuestion, exact: true });
    for (const part of rentDetails.tenancyEndDateParts) {
      const value = await group.getByLabel(part, { exact: true }).inputValue();
      if (value !== '') {
        throw new Error(`Expected tenancy end date ${part.toLowerCase()} to be empty, got ${value}`);
      }
    }
  });
});

Then('tenancy start date parts should be visible', async () => {
  await I.usePlaywrightTo('check tenancy start date inputs', async ({ page }) => {
    const group = page.getByRole('group', { name: rentDetails.tenancyStartDateQuestion, exact: true });
    for (const part of rentDetails.tenancyStartDateParts) {
      await group.getByLabel(part, { exact: true }).waitFor({ state: 'visible' });
    }
  });
});

When(
  'I enter date parts {string}, {string}, and {string} for tenancy start date',
  async (day: string, month: string, year: string) => {
    await I.usePlaywrightTo('enter tenancy start date parts', async ({ page }) => {
      const group = page.getByRole('group', { name: rentDetails.tenancyStartDateQuestion, exact: true });
      await group.getByLabel('Day', { exact: true }).fill(day);
      await group.getByLabel('Month', { exact: true }).fill(month);
      await group.getByLabel('Year', { exact: true }).fill(year);
    });
  }
);

Then('the tenancy start date should be {string}', async (date: string) => {
  const [day, month, year] = date.split('/');
  await I.usePlaywrightTo('check saved tenancy start date', async ({ page }) => {
    const group = page.getByRole('group', { name: rentDetails.tenancyStartDateQuestion, exact: true });
    for (const [part, expected] of [
      ['Day', day],
      ['Month', month],
      ['Year', year],
    ]) {
      const value = await group.getByLabel(part, { exact: true }).inputValue();
      if (value !== expected) {
        throw new Error(`Expected tenancy start ${part.toLowerCase()} ${expected}, got ${value}`);
      }
    }
  });
});

Then('the tenancy start date fields should be empty', async () => {
  await I.usePlaywrightTo('check tenancy start date was not saved', async ({ page }) => {
    const group = page.getByRole('group', { name: rentDetails.tenancyStartDateQuestion, exact: true });
    for (const part of rentDetails.tenancyStartDateParts) {
      const value = await group.getByLabel(part, { exact: true }).inputValue();
      if (value !== '') {
        throw new Error(`Expected tenancy start date ${part.toLowerCase()} to be empty, got ${value}`);
      }
    }
  });
});

When('I enter tribunal case reference number as {string}', (caseReference: string) => {
  I.fillField(rentDetails.tribunalCaseReferenceLabel, caseReference);
});

Then('the tribunal case reference field should be displayed', async () => {
  await I.usePlaywrightTo('check case reference field is visible', async ({ page }) => {
    await page.getByLabel(rentDetails.tribunalCaseReferenceLabel, { exact: true }).waitFor({ state: 'visible' });
  });
});

Then('the tribunal case reference field should not be displayed', async () => {
  await I.usePlaywrightTo('check case reference field is hidden', async ({ page }) => {
    await page.getByLabel(rentDetails.tribunalCaseReferenceLabel, { exact: true }).waitFor({ state: 'hidden' });
  });
});

Then('the tribunal case reference number should be {string}', (expected: string) => {
  I.seeInField(rentDetails.tribunalCaseReferenceLabel, expected);
});

Then('an error summary should be displayed', () => {
  I.seeElement(rentDetails.errorSummarySelector);
});

Then('an inline error should be displayed for the question {string}', async (question: string) => {
  await I.usePlaywrightTo('check inline error for question', async ({ page }) => {
    await page
      .getByRole('group', { name: question, exact: true })
      .locator(rentDetails.inlineErrorSelector)
      .first()
      .waitFor({ state: 'visible' });
  });
});
