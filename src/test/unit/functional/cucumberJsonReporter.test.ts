import fs from 'fs';

const { patchReporterSource } = require('../../functional/plugins/cucumberJsonReporter') as {
  patchReporterSource: (source: string) => string;
};

const reporterSource = fs.readFileSync(require.resolve('codeceptjs-cucumber-json-reporter'), 'utf8');

describe('cucumber JSON reporter', () => {
  const patched = patchReporterSource(reporterSource);

  it('ignores a Gherkin step that has no report result', () => {
    expect(patched).toContain(
      "if (report.step && report.step.result && report.step.result.status === 'skipped') report.step.result.status = 'passed';"
    );
    expect(patched).toContain('if (!report.step || !report.step.result) return;');
    expect(patched).toContain('if (!isBDD(step) || !report.step || !report.step.result) return;');
    expect(patched).not.toContain("if (report.step.result.status === 'skipped')");
    expect(patched).not.toContain('report.step = report.scenario.steps[report.stepPosition];');
  });

  it('still loads when the published reporter matches the patch', () => {
    expect(() => patchReporterSource(reporterSource)).not.toThrow();
  });
});
