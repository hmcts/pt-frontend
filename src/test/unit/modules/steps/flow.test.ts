import type { NextFunction, Request, Response } from 'express';

// The source module calls Logger.getLogger(...) once at module top-level, so
// the factory below must not close over an outer-scope const (that const
// would still be in its temporal dead zone the first time the factory runs).
// Instead the factory owns its own logger instance, and the test pulls that
// same instance back out via Logger.getLogger(...) below.
jest.mock('@modules/logger', () => {
  const logger = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };
  return {
    Logger: {
      getLogger: jest.fn(() => logger),
    },
  };
});

import {
  checkStepDependencies,
  createStepNavigation,
  getNextStep,
  getPreviousStep,
  getStepOrder,
  getStepUrl,
  stepDependencyCheckMiddleware,
} from '../../../../main/modules/steps/flow';
import {
  JourneyFlowConfig,
  JourneyFlowConfigResolver,
  SectionConfig,
} from '../../../../main/modules/steps/stepFlow.interface';

import { Logger } from '@modules/logger';

const mockLogger = Logger.getLogger('test') as unknown as {
  debug: jest.Mock;
  warn: jest.Mock;
  error: jest.Mock;
};

interface ReqOverrides {
  session?: { formData?: Record<string, unknown> };
  locals?: Record<string, unknown>;
  path?: string;
}

function buildReq({ session, locals, path }: ReqOverrides = {}): Request {
  return {
    path: path ?? '/',
    session: session ?? {},
    res: { locals: locals ?? {} },
  } as unknown as Request;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('steps/stepDependencyCheck', () => {
  describe('getNextStep', () => {
    describe('useShowConditions with flat stepOrder', () => {
      const flowConfig: JourneyFlowConfig = {
        useShowConditions: true,
        stepOrder: ['one', 'two', 'three', 'four'],
        steps: {
          two: { showCondition: () => false },
        },
      } as JourneyFlowConfig;

      it('returns the next step in order when it is visible', async () => {
        const result = await getNextStep(buildReq(), 'three', flowConfig, {});
        expect(result).toBe('four');
      });

      it('skips steps whose showCondition returns false', async () => {
        const result = await getNextStep(buildReq(), 'one', flowConfig, {});
        expect(result).toBe('three');
      });

      it('returns null when there is no visible step remaining', async () => {
        const result = await getNextStep(buildReq(), 'four', flowConfig, {});
        expect(result).toBeNull();
      });

      it('throws if the current step is not present in stepOrder', async () => {
        await expect(getNextStep(buildReq(), 'missing', flowConfig, {})).rejects.toThrow(
          'Step missing not found in stepOrder'
        );
      });
    });

    describe('useShowConditions with sections', () => {
      const sections: SectionConfig[] = [
        { id: 'section1', titleKey: 'section1', steps: ['a1', 'a2'] },
        { id: 'section2', titleKey: 'section2', steps: ['b1', 'b2'], isApplicable: jest.fn().mockResolvedValue(true) },
        { id: 'section3', titleKey: 'section3', steps: ['c1'] },
      ];

      const flowConfig: JourneyFlowConfig = {
        useShowConditions: true,
        sections,
        nonSectionStepOrder: ['n1', 'n2'],
        steps: {},
      } as JourneyFlowConfig;

      it('moves to the next step within the same section', async () => {
        const result = await getNextStep(buildReq(), 'a1', flowConfig, {});
        expect(result).toBe('a2');
      });

      it('moves into the next applicable section when the current section is exhausted', async () => {
        const result = await getNextStep(buildReq(), 'a2', flowConfig, {});
        expect(result).toBe('b1');
        expect(sections[1].isApplicable).toHaveBeenCalled();
      });

      it('skips a section whose isApplicable resolves to false', async () => {
        const skippableSections: SectionConfig[] = [
          { id: 'section4', titleKey: 'section4', steps: ['a1'] },
          { id: 'section5', titleKey: 'section5', steps: ['b1'], isApplicable: jest.fn().mockResolvedValue(false) },
          { id: 'section6', titleKey: 'section6', steps: ['c1'] },
        ];
        const config: JourneyFlowConfig = {
          useShowConditions: true,
          sections: skippableSections,
          steps: {},
        } as JourneyFlowConfig;

        const result = await getNextStep(buildReq(), 'a1', config, {});
        expect(result).toBe('c1');
      });

      it('skips remaining steps in the current section when it becomes inapplicable', async () => {
        const isApplicable = jest.fn().mockResolvedValue(false);
        const config: JourneyFlowConfig = {
          useShowConditions: true,
          sections: [
            { id: 'section7', titleKey: 'section7', steps: ['a1', 'a2'], isApplicable },
            { id: 'section8', titleKey: 'section8', steps: ['b1'] },
          ],
          steps: {},
        } as JourneyFlowConfig;

        const result = await getNextStep(buildReq(), 'a1', config, {});
        expect(result).toBe('b1');
      });

      it('falls through to nonSectionStepOrder once all sections are exhausted', async () => {
        const result = await getNextStep(buildReq(), 'c1', flowConfig, {});
        expect(result).toBe('n1');
      });

      it('returns null when nothing remains in sections or nonSectionStepOrder', async () => {
        const config: JourneyFlowConfig = {
          useShowConditions: true,
          sections: [{ id: 'section9', titleKey: 'section9', steps: ['a1'] }],
          steps: {},
        } as JourneyFlowConfig;

        const result = await getNextStep(buildReq(), 'a1', config, {});
        expect(result).toBeNull();
      });

      it('walks forward within nonSectionStepOrder when the current step lives there', async () => {
        const result = await getNextStep(buildReq(), 'n1', flowConfig, {});
        expect(result).toBe('n2');
      });

      it('throws if the current step cannot be located anywhere', async () => {
        await expect(getNextStep(buildReq(), 'ghost', flowConfig, {})).rejects.toThrow(
          'Step ghost not found in stepOrder'
        );
      });
    });

    describe('route conditions (useShowConditions falsy)', () => {
      it('returns the nextStep of the first route with no condition', async () => {
        const flowConfig: JourneyFlowConfig = {
          stepOrder: ['one', 'two'],
          steps: {
            one: { routes: [{ nextStep: 'two' }] },
          },
        } as JourneyFlowConfig;

        const result = await getNextStep(buildReq(), 'one', flowConfig, {});
        expect(result).toBe('two');
      });

      it('returns the nextStep of the first route whose condition resolves true', async () => {
        const conditionA = jest.fn().mockResolvedValue(false);
        const conditionB = jest.fn().mockResolvedValue(true);
        const flowConfig: JourneyFlowConfig = {
          stepOrder: ['one', 'two', 'three'],
          steps: {
            one: {
              routes: [
                { condition: conditionA, nextStep: 'two' },
                { condition: conditionB, nextStep: 'three' },
              ],
            },
          },
        } as JourneyFlowConfig;

        const formData = { foo: 'bar' };
        const currentStepData = { baz: 'qux' };
        const result = await getNextStep(buildReq(), 'one', flowConfig, formData, currentStepData);

        expect(result).toBe('three');
        expect(conditionA).toHaveBeenCalledWith(expect.anything(), formData, currentStepData);
        expect(conditionB).toHaveBeenCalledWith(expect.anything(), formData, currentStepData);
      });

      it('falls back to defaultNext when no route matches', async () => {
        const flowConfig: JourneyFlowConfig = {
          stepOrder: ['one', 'two', 'fallback'],
          steps: {
            one: {
              routes: [{ condition: jest.fn().mockResolvedValue(false), nextStep: 'two' }],
              defaultNext: 'fallback',
            },
          },
        } as JourneyFlowConfig;

        const result = await getNextStep(buildReq(), 'one', flowConfig, {});
        expect(result).toBe('fallback');
      });

      it('falls back to the stepOrder index when there are no routes or defaultNext', async () => {
        const flowConfig: JourneyFlowConfig = {
          stepOrder: ['one', 'two', 'three'],
          steps: { one: {} },
        } as JourneyFlowConfig;

        const result = await getNextStep(buildReq(), 'one', flowConfig, {});
        expect(result).toBe('two');
      });

      it('returns null when the step is last in stepOrder and has no routing config', async () => {
        const flowConfig: JourneyFlowConfig = {
          stepOrder: ['one', 'two'],
          steps: {},
        } as JourneyFlowConfig;

        const result = await getNextStep(buildReq(), 'two', flowConfig, {});
        expect(result).toBeNull();
      });

      it('returns null when the step is not found anywhere', async () => {
        const flowConfig: JourneyFlowConfig = {
          stepOrder: ['one'],
          steps: {},
        } as JourneyFlowConfig;

        const result = await getNextStep(buildReq(), 'unknown', flowConfig, {});
        expect(result).toBeNull();
      });
    });
  });

  describe('getPreviousStep', () => {
    describe('useShowConditions with flat stepOrder', () => {
      // Note: isStepVisibleAndCanGoBack only enforces preventBack when the step
      // also defines a showCondition — a step with preventBack but no
      // showCondition is treated as visible/back-navigable regardless.
      const flowConfig: JourneyFlowConfig = {
        useShowConditions: true,
        stepOrder: ['one', 'two', 'three', 'four'],
        steps: {
          two: { showCondition: () => false },
          three: { showCondition: () => true, preventBack: true },
        },
      } as JourneyFlowConfig;

      it('returns the previous visible, back-navigable step', async () => {
        const result = await getPreviousStep(buildReq(), 'two', flowConfig);
        expect(result).toBe('one');
      });

      it('skips steps flagged preventBack (when a showCondition is also present)', async () => {
        const result = await getPreviousStep(buildReq(), 'four', flowConfig);
        expect(result).toBe('one');
      });

      it('does not skip a preventBack step when it has no showCondition', async () => {
        const config: JourneyFlowConfig = {
          useShowConditions: true,
          stepOrder: ['one', 'two'],
          steps: { two: { preventBack: true } },
        } as JourneyFlowConfig;

        // Going back FROM two is blocked (handled one level up), but two
        // showing up as a *candidate* previous step is not skipped here.
        const result = await getPreviousStep(buildReq(), 'one', config);
        expect(result).toBeNull();
      });

      it('returns null immediately when the current step itself prevents back navigation', async () => {
        const config: JourneyFlowConfig = {
          useShowConditions: true,
          stepOrder: ['one', 'two'],
          steps: { two: { preventBack: true } },
        } as JourneyFlowConfig;

        const result = await getPreviousStep(buildReq(), 'two', config);
        expect(result).toBeNull();
      });

      it('returns null when at the start of the journey', async () => {
        const result = await getPreviousStep(buildReq(), 'one', flowConfig);
        expect(result).toBeNull();
      });
    });

    describe('useShowConditions with sections', () => {
      it('stays within the current section when possible', async () => {
        const flowConfig: JourneyFlowConfig = {
          useShowConditions: true,
          sections: [{ id: 'section10', titleKey: 'section10', steps: ['a1', 'a2'] }],
          steps: {},
        } as JourneyFlowConfig;

        const result = await getPreviousStep(buildReq(), 'a2', flowConfig);
        expect(result).toBe('a1');
      });

      it('returns the hub step when leaving a section and one is configured', async () => {
        const flowConfig: JourneyFlowConfig = {
          useShowConditions: true,
          sections: [{ id: 'section11', titleKey: 'section11', steps: ['a1'] }],
          nonSectionStepOrder: ['hub'],
          hubStepName: 'hub',
          steps: {},
        } as JourneyFlowConfig;

        const result = await getPreviousStep(buildReq(), 'a1', flowConfig);
        expect(result).toBe('hub');
      });

      it('walks backward through previous applicable sections when there is no hub', async () => {
        const flowConfig: JourneyFlowConfig = {
          useShowConditions: true,
          sections: [
            { id: 'section12', titleKey: 'section12', steps: ['a1'] },
            { id: 'section13', titleKey: 'section13', steps: ['b1'] },
          ],
          steps: {},
        } as JourneyFlowConfig;

        const result = await getPreviousStep(buildReq(), 'b1', flowConfig);
        expect(result).toBe('a1');
      });

      it('skips inapplicable sections while walking backward', async () => {
        const flowConfig: JourneyFlowConfig = {
          useShowConditions: true,
          sections: [
            { id: 'section14', titleKey: 'section14', steps: ['a1'] },
            { id: 'section15', titleKey: 'section15', steps: ['b1'], isApplicable: jest.fn().mockResolvedValue(false) },
            { id: 'section16', titleKey: 'section16', steps: ['c1'] },
          ],
          steps: {},
        } as JourneyFlowConfig;

        const result = await getPreviousStep(buildReq(), 'c1', flowConfig);
        expect(result).toBe('a1');
      });

      it('walks backward within nonSectionStepOrder before falling back to sections', async () => {
        const flowConfig: JourneyFlowConfig = {
          useShowConditions: true,
          sections: [{ id: 'section17', titleKey: 'section17', steps: ['a1'] }],
          nonSectionStepOrder: ['n1', 'n2'],
          steps: {},
        } as JourneyFlowConfig;

        const result = await getPreviousStep(buildReq(), 'n2', flowConfig);
        expect(result).toBe('n1');
      });

      it('falls back to sections in reverse when nonSectionStepOrder is exhausted', async () => {
        const flowConfig: JourneyFlowConfig = {
          useShowConditions: true,
          sections: [{ id: 'section18', titleKey: 'section18', steps: ['a1'] }],
          nonSectionStepOrder: ['n1'],
          steps: {},
        } as JourneyFlowConfig;

        const result = await getPreviousStep(buildReq(), 'n1', flowConfig);
        expect(result).toBe('a1');
      });

      it('returns null when there is nowhere left to go', async () => {
        const flowConfig: JourneyFlowConfig = {
          useShowConditions: true,
          sections: [{ id: 'section19', titleKey: 'section19', steps: ['a1'] }],
          steps: {},
        } as JourneyFlowConfig;

        const result = await getPreviousStep(buildReq(), 'a1', flowConfig);
        expect(result).toBeNull();
      });

      it('throws if the current step cannot be located', async () => {
        const flowConfig: JourneyFlowConfig = {
          useShowConditions: true,
          sections: [{ id: 'section20', titleKey: 'section20', steps: ['a1'] }],
          steps: {},
        } as JourneyFlowConfig;

        await expect(getPreviousStep(buildReq(), 'ghost', flowConfig)).rejects.toThrow(
          'Step ghost not found in stepOrder'
        );
      });
    });

    describe('route conditions (useShowConditions falsy)', () => {
      it('uses an explicit static previousStep when configured', async () => {
        const flowConfig: JourneyFlowConfig = {
          stepOrder: ['one', 'two'],
          steps: { two: { previousStep: 'one' } },
        } as JourneyFlowConfig;

        const result = await getPreviousStep(buildReq(), 'two', flowConfig);
        expect(result).toBe('one');
      });

      it('invokes a function previousStep with req and formData', async () => {
        const previousStep = jest.fn().mockReturnValue('dynamic-prev');
        const flowConfig: JourneyFlowConfig = {
          stepOrder: ['one', 'two'],
          steps: { two: { previousStep } },
        } as JourneyFlowConfig;

        const req = buildReq();
        const formData = { foo: 'bar' };
        const result = await getPreviousStep(req, 'two', flowConfig, formData);

        expect(result).toBe('dynamic-prev');
        expect(previousStep).toHaveBeenCalledWith(req, formData);
      });

      it('finds the step whose unconditional route leads here', async () => {
        const flowConfig: JourneyFlowConfig = {
          stepOrder: ['one', 'two'],
          steps: {
            one: { routes: [{ nextStep: 'two' }] },
            two: {},
          },
        } as JourneyFlowConfig;

        const result = await getPreviousStep(buildReq(), 'two', flowConfig);
        expect(result).toBe('one');
      });

      it('finds the step whose conditional route resolves true and leads here', async () => {
        const flowConfig: JourneyFlowConfig = {
          stepOrder: ['one', 'two'],
          steps: {
            one: {
              routes: [{ condition: jest.fn().mockResolvedValue(true), nextStep: 'two' }],
            },
            two: {},
          },
        } as JourneyFlowConfig;

        const formData = { some: 'data' };
        const result = await getPreviousStep(buildReq(), 'two', flowConfig, formData);
        expect(result).toBe('one');
      });

      it('skips a conditional route that resolves false', async () => {
        const flowConfig: JourneyFlowConfig = {
          stepOrder: ['one', 'two', 'three'],
          steps: {
            one: {
              routes: [{ condition: jest.fn().mockResolvedValue(false), nextStep: 'two' }],
            },
            three: { defaultNext: 'two' },
            two: {},
          },
        } as JourneyFlowConfig;

        const result = await getPreviousStep(buildReq(), 'two', flowConfig);
        expect(result).toBe('three');
      });

      it('finds the step whose defaultNext leads here', async () => {
        const flowConfig: JourneyFlowConfig = {
          stepOrder: ['one', 'two'],
          steps: {
            one: { defaultNext: 'two' },
            two: {},
          },
        } as JourneyFlowConfig;

        const result = await getPreviousStep(buildReq(), 'two', flowConfig);
        expect(result).toBe('one');
      });

      it('falls back to the stepOrder index when nothing routes here explicitly', async () => {
        const flowConfig: JourneyFlowConfig = {
          stepOrder: ['one', 'two'],
          steps: {},
        } as JourneyFlowConfig;

        const result = await getPreviousStep(buildReq(), 'two', flowConfig);
        expect(result).toBe('one');
      });

      it('returns null when at the start of stepOrder with no routing config', async () => {
        const flowConfig: JourneyFlowConfig = {
          stepOrder: ['one', 'two'],
          steps: {},
        } as JourneyFlowConfig;

        const result = await getPreviousStep(buildReq(), 'one', flowConfig);
        expect(result).toBeNull();
      });
    });
  });

  describe('getStepUrl', () => {
    it('appends the step name to basePath', () => {
      const flowConfig: JourneyFlowConfig = { basePath: '/case', steps: {} } as JourneyFlowConfig;
      expect(getStepUrl('details', flowConfig)).toBe('/case/details');
    });

    it('substitutes :caseReference in basePath when provided', () => {
      const flowConfig: JourneyFlowConfig = { basePath: '/case/:caseReference', steps: {} } as JourneyFlowConfig;
      expect(getStepUrl('details', flowConfig, 'CASE-123')).toBe('/case/CASE-123/details');
    });

    it('leaves :caseReference untouched when no caseReference is passed', () => {
      const flowConfig: JourneyFlowConfig = { basePath: '/case/:caseReference', steps: {} } as JourneyFlowConfig;
      expect(getStepUrl('details', flowConfig)).toBe('/case/:caseReference/details');
    });

    it('returns basePath alone for the entry step at base path', () => {
      const flowConfig: JourneyFlowConfig = {
        basePath: '/case',
        entryStepIdAtBasePath: 'start',
        steps: {},
      } as JourneyFlowConfig;

      expect(getStepUrl('start', flowConfig)).toBe('/case');
    });

    it('defaults basePath to an empty string when not configured', () => {
      const flowConfig: JourneyFlowConfig = { id: 'section21', titleKey: 'section21', steps: {} } as JourneyFlowConfig;
      expect(getStepUrl('details', flowConfig)).toBe('/details');
    });
  });

  describe('checkStepDependencies', () => {
    it('returns null when the step has no dependencies configured', () => {
      const flowConfig: JourneyFlowConfig = {
        id: 'section22',
        titleKey: 'section22',
        steps: { one: {} },
      } as JourneyFlowConfig;
      expect(checkStepDependencies('one', flowConfig, {})).toBeNull();
    });

    it('returns null when the step is not present in steps', () => {
      const flowConfig: JourneyFlowConfig = { id: 'section23', titleKey: 'section23', steps: {} } as JourneyFlowConfig;
      expect(checkStepDependencies('unknown', flowConfig, {})).toBeNull();
    });

    it('returns the first unmet dependency', () => {
      const flowConfig: JourneyFlowConfig = {
        steps: { two: { dependencies: ['a', 'b'] } },
      } as JourneyFlowConfig;

      expect(checkStepDependencies('two', flowConfig, { a: 'present' })).toBe('b');
    });

    it('returns null when all dependencies are satisfied', () => {
      const flowConfig: JourneyFlowConfig = {
        steps: { two: { dependencies: ['a', 'b'] } },
      } as JourneyFlowConfig;

      expect(checkStepDependencies('two', flowConfig, { a: 'x', b: 'y' })).toBeNull();
    });

    it('treats falsy formData values as unmet', () => {
      const flowConfig: JourneyFlowConfig = {
        steps: { two: { dependencies: ['a'] } },
      } as JourneyFlowConfig;

      expect(checkStepDependencies('two', flowConfig, { a: '' })).toBe('a');
    });
  });

  describe('getStepOrder', () => {
    it('returns the explicit stepOrder when present', () => {
      const flowConfig: JourneyFlowConfig = { stepOrder: ['one', 'two'], steps: {} } as JourneyFlowConfig;
      expect(getStepOrder(flowConfig)).toEqual(['one', 'two']);
    });

    it('builds an order from sections followed by nonSectionStepOrder', () => {
      const flowConfig: JourneyFlowConfig = {
        sections: [
          { id: 'section24', titleKey: 'section24', steps: ['a1', 'a2'] },
          { id: 'section25', titleKey: 'section25', steps: ['b1'] },
        ],
        nonSectionStepOrder: ['n1'],
        steps: {},
      } as JourneyFlowConfig;

      expect(getStepOrder(flowConfig)).toEqual(['a1', 'a2', 'b1', 'n1']);
    });

    it('builds an order from sections alone when nonSectionStepOrder is absent', () => {
      const flowConfig: JourneyFlowConfig = {
        sections: [{ id: 'section26', titleKey: 'section26', steps: ['a1'] }],
        steps: {},
      } as JourneyFlowConfig;

      expect(getStepOrder(flowConfig)).toEqual(['a1']);
    });

    it('throws when neither stepOrder nor sections are configured', () => {
      const flowConfig: JourneyFlowConfig = { id: 'section27', titleKey: 'section27', steps: {} } as JourneyFlowConfig;
      expect(() => getStepOrder(flowConfig)).toThrow(
        'JourneyFlowConfig requires stepOrder when sections are not configured'
      );
    });
  });

  describe('createStepNavigation', () => {
    const flowConfig: JourneyFlowConfig = {
      basePath: '/case/:caseReference',
      stepOrder: ['one', 'two'],
      steps: {},
    } as JourneyFlowConfig;

    it('getNextStepUrl resolves the next step to a full url', async () => {
      const nav = createStepNavigation(flowConfig);
      const req = buildReq({ locals: { validatedCase: { id: 'CASE-1' } } });

      const url = await nav.getNextStepUrl(req, 'one');
      expect(url).toBe('/case/CASE-1/two');
    });

    it('getNextStepUrl returns null when there is no next step', async () => {
      const nav = createStepNavigation(flowConfig);
      const url = await nav.getNextStepUrl(buildReq(), 'two');
      expect(url).toBeNull();
    });

    it('getNextStepUrl reads formData from the session and forwards currentStepData', async () => {
      const condition = jest.fn().mockResolvedValue(true);
      const config: JourneyFlowConfig = {
        basePath: '/case',
        stepOrder: ['one', 'two'],
        steps: { one: { routes: [{ condition, nextStep: 'two' }] } },
      } as JourneyFlowConfig;
      const nav = createStepNavigation(config);
      const formData = { foo: 'bar' };
      const currentStepData = { baz: 'qux' };

      await nav.getNextStepUrl(buildReq({ session: { formData } }), 'one', currentStepData);

      expect(condition).toHaveBeenCalledWith(expect.anything(), formData, currentStepData);
    });

    it('getBackUrl resolves the previous step to a full url', async () => {
      const nav = createStepNavigation(flowConfig);
      const req = buildReq({ locals: { validatedCase: { id: 'CASE-1' } } });

      const url = await nav.getBackUrl(req, 'two');
      expect(url).toBe('/case/CASE-1/one');
    });

    it('getBackUrl returns null when there is no previous step', async () => {
      const nav = createStepNavigation(flowConfig);
      const url = await nav.getBackUrl(buildReq(), 'one');
      expect(url).toBeNull();
    });

    it('getStepUrl builds a url for a static flow config', () => {
      const nav = createStepNavigation({ basePath: '/case', steps: {} } as JourneyFlowConfig);
      expect(nav.getStepUrl('details')).toBe('/case/details');
    });

    it('getStepUrl throws when the navigation was built from a resolver', () => {
      const resolver: JourneyFlowConfigResolver = () => flowConfig;
      const nav = createStepNavigation(resolver);
      expect(() => nav.getStepUrl('details')).toThrow(
        'getStepUrl requires a static JourneyFlowConfig when a resolver is used'
      );
    });

    it('resolves an async flowConfig resolver per call', async () => {
      const resolver: JourneyFlowConfigResolver = jest.fn().mockResolvedValue(flowConfig);
      const nav = createStepNavigation(resolver);

      const url = await nav.getNextStepUrl(buildReq(), 'one');

      expect(resolver).toHaveBeenCalled();
      expect(url).toBe('/case/:caseReference/two');
    });

    it('appends ?nav=1 when back navigation lands on a mid-section step', async () => {
      const config: JourneyFlowConfig = {
        useShowConditions: true,
        basePath: '/case',
        sections: [{ id: 'section28', titleKey: 'section28', steps: ['a1', 'a2', 'a3'] }],
        steps: {},
      } as JourneyFlowConfig;
      const nav = createStepNavigation(config);

      // a3 -> a2, and a2 is not the section's first visible step, so it is tagged.
      const backUrl = await nav.getBackUrl(buildReq(), 'a3');
      expect(backUrl).toBe('/case/a2?nav=1');
    });

    it('does not append ?nav=1 when back navigation lands on the first step of a section', async () => {
      const config: JourneyFlowConfig = {
        useShowConditions: true,
        basePath: '/case',
        sections: [{ id: 'section29', titleKey: 'section29', steps: ['a1', 'a2'] }],
        steps: {},
      } as JourneyFlowConfig;
      const nav = createStepNavigation(config);

      const backUrl = await nav.getBackUrl(buildReq(), 'a2');
      expect(backUrl).toBe('/case/a1');
    });

    it('does not append nav=1 for the hub or non-section steps', async () => {
      const config: JourneyFlowConfig = {
        useShowConditions: true,
        basePath: '/case',
        sections: [{ id: 'section30', titleKey: 'section30', steps: ['a1'] }],
        nonSectionStepOrder: ['hub'],
        hubStepName: 'hub',
        steps: {},
      } as JourneyFlowConfig;
      const nav = createStepNavigation(config);

      const backUrl = await nav.getBackUrl(buildReq(), 'a1');
      expect(backUrl).toBe('/case/hub');
    });
  });

  describe('stepDependencyCheckMiddleware', () => {
    function buildMiddlewareArgs(
      overrides: {
        path?: string;
        formData?: Record<string, unknown>;
        caseId?: string;
      } = {}
    ) {
      const req = buildReq({
        path: overrides.path ?? '/case/details',
        session: { formData: overrides.formData ?? {} },
      });
      const redirect = jest.fn();
      const res = {
        locals: overrides.caseId ? { validatedCase: { id: overrides.caseId } } : {},
        redirect,
      } as unknown as Response;
      const next = jest.fn() as NextFunction;
      return { req, res, next, redirect };
    }

    it('calls next() when the step has no unmet dependencies', async () => {
      const flowConfig: JourneyFlowConfig = { basePath: '/case', steps: { details: {} } } as JourneyFlowConfig;
      const middleware = stepDependencyCheckMiddleware(flowConfig);
      const { req, res, next, redirect } = buildMiddlewareArgs();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(redirect).not.toHaveBeenCalled();
    });

    it('redirects to the missing dependency step with a 303', async () => {
      const flowConfig: JourneyFlowConfig = {
        basePath: '/case',
        steps: { details: { dependencies: ['startedAt'] } },
      } as JourneyFlowConfig;
      const middleware = stepDependencyCheckMiddleware(flowConfig);
      const { req, res, next, redirect } = buildMiddlewareArgs();

      await middleware(req, res, next);

      expect(redirect).toHaveBeenCalledWith(303, '/case/startedAt');
      expect(next).not.toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith('Step details has unmet dependency: startedAt');
    });

    it('substitutes :caseReference in the redirect url when a validated case is present', async () => {
      const flowConfig: JourneyFlowConfig = {
        basePath: '/case/:caseReference',
        steps: { details: { dependencies: ['startedAt'] } },
      } as JourneyFlowConfig;
      const middleware = stepDependencyCheckMiddleware(flowConfig);
      const { req, res, next, redirect } = buildMiddlewareArgs({
        path: '/case/CASE-1/details',
        caseId: 'CASE-1',
      });

      await middleware(req, res, next);

      expect(redirect).toHaveBeenCalledWith(303, '/case/CASE-1/startedAt');
    });

    it('calls next() immediately when the request path has no trailing segment', async () => {
      const flowConfig: JourneyFlowConfig = { basePath: '', steps: {} } as JourneyFlowConfig;
      const middleware = stepDependencyCheckMiddleware(flowConfig);
      const { req, res, next } = buildMiddlewareArgs({ path: '/' });

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('maps a request at the resolved basePath to entryStepIdAtBasePath', async () => {
      const flowConfig: JourneyFlowConfig = {
        basePath: '/case/:caseReference',
        entryStepIdAtBasePath: 'start',
        steps: { start: { dependencies: ['claimAccepted'] } },
      } as JourneyFlowConfig;
      const middleware = stepDependencyCheckMiddleware(flowConfig);
      const { req, res, next, redirect } = buildMiddlewareArgs({
        path: '/case/CASE-1',
        caseId: 'CASE-1',
      });

      await middleware(req, res, next);

      expect(redirect).toHaveBeenCalledWith(303, '/case/CASE-1/claimAccepted');
    });

    it('resolves a JourneyFlowConfigResolver before checking dependencies', async () => {
      const flowConfig: JourneyFlowConfig = {
        basePath: '/case',
        steps: { details: { dependencies: ['startedAt'] } },
      } as JourneyFlowConfig;
      const resolver: JourneyFlowConfigResolver = jest.fn().mockResolvedValue(flowConfig);
      const middleware = stepDependencyCheckMiddleware(resolver);
      const { req, res, next, redirect } = buildMiddlewareArgs();

      await middleware(req, res, next);

      expect(resolver).toHaveBeenCalledWith(req);
      expect(redirect).toHaveBeenCalledWith(303, '/case/startedAt');
    });
  });
});
