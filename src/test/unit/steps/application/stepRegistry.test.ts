import type { Request } from 'express';

import { flowConfig } from '../../../../main/steps/application/flow.config';
import { applicationSections } from '../../../../main/steps/application/sections.config';
import { stepRegistry } from '../../../../main/steps/application/stepRegistry';

const CASE_REF = '1234123412341234';

describe('application step registry', () => {
  it.each(Object.entries(stepRegistry))('registers %s under its own step name', (key, step) => {
    expect(step.name).toBe(key);
  });

  it('places every registered step in a section or the non-section step order', () => {
    const placed = new Set([
      ...applicationSections.flatMap(section => section.steps),
      ...(flowConfig.nonSectionStepOrder ?? []),
    ]);

    expect(Object.keys(stepRegistry).filter(name => !placed.has(name))).toEqual([]);
  });

  it.each(Object.entries(stepRegistry))('%s can work out isAnswered for a brand new case', (_name, step) => {
    const req = {
      params: { caseReference: CASE_REF },
      session: { ccdCase: { caseReference: CASE_REF }, formData: {} },
    } as unknown as Request;

    expect(() => step.isAnswered?.(req)).not.toThrow();
  });
});
