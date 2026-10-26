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
