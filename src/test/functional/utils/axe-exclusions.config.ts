/**
 * Selectors excluded from axe scans.
 *
 * GOV.UK Design System conditional radio reveals set aria-expanded on the radio
 * input. axe flags that as aria-allowed-attr. Same exclusion rationale as
 * pcs-frontend src/test/ui/config/axe-exclusions.config.ts (per-radio IDs there;
 * attribute selector here so new conditional radios are covered automatically).
 */
export const axeExclusions = [
  // Decorative GOV.UK brand assets already excluded from the pa11y suite.
  '.govuk-footer__licence-logo',
  '.govuk-footer__crown',
  '.govuk-header__logotype-crown',
  // Conditional reveal radios (aria-expanded on input type=radio).
  'input.govuk-radios__input[aria-expanded]',
];
