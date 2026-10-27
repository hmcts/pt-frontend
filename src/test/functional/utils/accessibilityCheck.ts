import { AxeBuilder } from '@axe-core/playwright';
import type { Page } from 'playwright';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** Decorative GOV.UK brand assets already excluded from the pa11y suite. */
const EXCLUDED_SELECTORS = ['.govuk-footer__licence-logo', '.govuk-footer__crown', '.govuk-header__logotype-crown'];

/** Axe audits HTML. PDF downloads and non-http viewers have no DOM to scan. */
export function accessibilitySkipReason(pageUrl: string): string | undefined {
  try {
    const url = new URL(pageUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return `Skipping axe check because ${pageUrl} is not an HTML page`;
    }
    if (url.pathname.toLowerCase().endsWith('.pdf')) {
      return `Skipping axe check because ${pageUrl} is a PDF`;
    }
    return undefined;
  } catch {
    return `Skipping axe check because ${pageUrl} is not an HTML page`;
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

export async function checkPageAccessibility(page: Page): Promise<void> {
  const builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);
  for (const selector of EXCLUDED_SELECTORS) {
    builder.exclude(selector);
  }

  const { violations } = await builder.analyze();
  if (violations.length > 0) {
    throw new Error(formatViolations(page.url(), violations));
  }
}
