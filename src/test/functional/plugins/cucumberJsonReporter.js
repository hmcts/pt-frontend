const fs = require('fs');
const Module = require('module');
const path = require('path');

// The published reporter fails the Before hook when a Gherkin step has no
// prebuilt result. A retried Background, or one extra bdd step, walks off the
// parsed step list and `report.step` is undefined. The steps themselves have
// already passed. Keep the reporter, and ignore a missing step result.
const reporterPath = require.resolve('codeceptjs-cucumber-json-reporter');

function patchReporterSource(source) {
  return [
    [
      `      report.scenario = getScenarioFromReport(report.feature, test.title);
      report.scenario.executed = true;
      report.stepPosition = 0;`,
      `      report.scenario = getScenarioFromReport(report.feature, test.title);
      if (!report.scenario) return;
      report.scenario.executed = true;
      report.stepPosition = 0;
      report.step = null;`,
    ],
    [
      '      report.step = report.scenario.steps[report.stepPosition];',
      '      const steps = report.scenario && report.scenario.steps;\n      report.step = steps && steps[report.stepPosition];',
    ],
    [
      "      if (report.step.result.status === 'skipped') report.step.result.status = 'passed';",
      "      if (report.step && report.step.result && report.step.result.status === 'skipped') report.step.result.status = 'passed';",
    ],
    [
      `  event.dispatcher.on(event.test.failed, (test, error) => {
    report.step.result.status = 'failed';`,
      `  event.dispatcher.on(event.test.failed, (test, error) => {
    if (!report.step || !report.step.result) return;
    report.step.result.status = 'failed';`,
    ],
    [
      `    if (!isBDD(step)) return;
    report.step.result.status = 'passed';`,
      `    if (!isBDD(step) || !report.step || !report.step.result) return;
    report.step.result.status = 'passed';`,
    ],
    [
      `    if (!isBDD(step)) return;
    report.step.result.status = 'failed';`,
      `    if (!isBDD(step) || !report.step || !report.step.result) return;
    report.step.result.status = 'failed';`,
    ],
    ['      if (report && report.step) {', '      if (report && report.step && report.step.result) {'],
    [
      '    report.step.embeddings.push(comment);',
      '    if (!report.step || !report.step.embeddings) return;\n    report.step.embeddings.push(comment);',
    ],
  ].reduce((patched, [from, to]) => {
    if (!patched.includes(from)) {
      throw new Error(`Cucumber JSON reporter patch could not find:\n${from}`);
    }
    return patched.replace(from, to);
  }, source);
}

let patchedReporter;

function loadPatchedReporter() {
  if (patchedReporter) return patchedReporter;
  const codeceptjs = require('codeceptjs');
  const patched = patchReporterSource(fs.readFileSync(reporterPath, 'utf8'));
  const patchedModule = new Module(reporterPath);
  patchedModule.filename = reporterPath;
  patchedModule.paths = Module._nodeModulePaths(path.dirname(reporterPath));
  patchedModule.require = function (request) {
    if (request === 'codeceptjs') return codeceptjs;
    return Module.prototype.require.call(this, request);
  };
  patchedModule._compile(patched, reporterPath);
  patchedReporter = patchedModule.exports;
  return patchedReporter;
}

module.exports = function (config) {
  return loadPatchedReporter()(config);
};
module.exports.patchReporterSource = patchReporterSource;
