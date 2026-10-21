import { AxeBuilder } from '@axe-core/playwright';

import { config as testConfig } from '../config';

const { I } = inject();

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** Decorative GOV.UK brand assets already excluded from the pa11y suite. */
const EXCLUDED_SELECTORS = ['.govuk-footer__licence-logo', '.govuk-footer__crown', '.govuk-header__logotype-crown'];

function isApplicationPage(pageUrl: string): boolean {
  try {
    return new URL(pageUrl).origin === new URL(testConfig.TEST_URL).origin;
  } catch {
    return false;
  }
}

function formatTarget(target: (string | string[])[]): string {
  return target.map(part => (Array.isArray(part) ? part.join(' ') : part)).join(' ');
}

function formatViolations(url: string, violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']): string {
  const details = violations
    .map(violation => {
      const targets = violation.nodes
        .map(node => {
          const target = formatTarget(node.target);
          const summary = node.failureSummary?.split('\n')[0] ?? '';
          return `  - ${target}${summary ? `: ${summary}` : ''}`;
        })
        .join('\n');
      return `${violation.id} (${violation.impact ?? 'unknown'}): ${violation.help}\n${violation.helpUrl}\n${targets}`;
    })
    .join('\n\n');

  return `Accessibility issues on ${url}:\n${details}`;
}

Then('I check the page for accessibility issues', async () => {
  const currentUrl = await I.grabCurrentUrl();
  if (!isApplicationPage(currentUrl)) {
    I.say(`Skipping axe check because ${currentUrl} is outside the application`);
    return;
  }

  await I.usePlaywrightTo('run axe accessibility check', async ({ page }) => {
    const builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);
    for (const selector of EXCLUDED_SELECTORS) {
      builder.exclude(selector);
    }

    const { violations } = await builder.analyze();
    if (violations.length > 0) {
      throw new Error(formatViolations(page.url(), violations));
    }
  });
});
