import type { Request } from 'express';

import { flowConfig } from '../../../../main/steps/application/flow.config';

const CASE_REF = '1234123412341234';

const makeReq = (answers: Record<string, Record<string, unknown>> = {}): Request =>
  ({
    params: { caseReference: CASE_REF },
    session: { formData: { [CASE_REF]: answers } },
  }) as unknown as Request;

const isShown = (stepName: string, req: Request) => flowConfig.steps[stepName].showCondition?.(req);

describe('application flow config show conditions', () => {
  const singleAnswerGates: [string, string, string, string, string[]][] = [
    ['upload-floor-plan-of-property', 'floor-plan-of-property', 'hasFloorPlanOfProperty', 'yes', ['no']],
    ['upload-tenancy-agreement', 'have-tenancy-agreement', 'copyOfTenancyAgreement', 'Yes', ['No']],
    [
      'upload-evidence-notice-not-legally-valid',
      'your-notice-proposing-a-new-rent',
      'noticeLegallyValid',
      'no',
      ['yes'],
    ],
    ['upload-evidence-experience-hardship', 'hardship', 'rentIncreaseCauseHardship', 'yes', ['no']],
    [
      'upload-evidence-improvements-or-repairs',
      'repairs-and-improvements',
      'hasRepairsAndImprovements',
      'yes',
      ['no', 'notSure'],
    ],
    ['council-tax-frequency', 'rent-includes-council-tax', 'rentIncludesCouncilTax', 'Yes', ['No']],
    ['utilities-paid-frequency', 'rent-inclusive-of-utility-charges', 'rentInclusiveOfUtilityCharges', 'Yes', ['No']],
    [
      'other-household-management-charges-details',
      'other-household-management-charges',
      'anyOtherHouseholdManagementCharges',
      'Yes',
      ['No'],
    ],
    [
      'additional-rental-service-charges-vary',
      'other-household-management-charges',
      'anyOtherHouseholdManagementCharges',
      'Yes',
      ['No'],
    ],
    ['you-need-to-apply-for-help-with-fees', 'have-you-applied-for-help', 'appliedForHelpWithFees', 'No', ['Yes']],
  ];

  it.each(singleAnswerGates)('shows %s when %s.%s is %s', (stepName, parentStep, field, showValue) => {
    expect(isShown(stepName, makeReq({ [parentStep]: { [field]: showValue } }))).toBe(true);
  });

  it.each(
    singleAnswerGates.flatMap(([stepName, parentStep, field, , hideValues]) =>
      hideValues.map(value => [stepName, parentStep, field, value] as const)
    )
  )('hides %s when %s.%s is %s', (stepName, parentStep, field, hideValue) => {
    expect(isShown(stepName, makeReq({ [parentStep]: { [field]: hideValue } }))).toBe(false);
  });

  it.each(singleAnswerGates)('hides %s when %s has not been answered', stepName => {
    expect(isShown(stepName, makeReq())).toBe(false);
  });

  describe('letting agent and representative pages', () => {
    const parentStep = 'landlord-has-letting-agent-or-representative';
    const answers = [
      'lettingAgentOnly',
      'representativeOnly',
      'lettingAgentAndRepresentative',
      'noLettingAgentAndRepresentative',
      'notSure',
    ];
    const agentAnswers = ['lettingAgentOnly', 'lettingAgentAndRepresentative'];
    const representativeAnswers = ['representativeOnly', 'lettingAgentAndRepresentative'];

    const gates: [string, string[]][] = [
      ['landlord-letting-agent-email-address', agentAnswers],
      ['landlord-letting-agent-phone-number', agentAnswers],
      ['landlord-representative-details', representativeAnswers],
      ['landlord-representative-email-address', representativeAnswers],
      ['landlord-representative-phone-number', representativeAnswers],
    ];

    it.each(
      gates.flatMap(([stepName, showFor]) =>
        answers.map(answer => [stepName, showFor.includes(answer) ? 'shows' : 'hides', answer] as const)
      )
    )('%s %s for %s', (stepName, outcome, answer) => {
      const req = makeReq({ [parentStep]: { landlordHasLettingAgentOrRepresentative: answer } });

      expect(isShown(stepName, req)).toBe(outcome === 'shows');
    });

    it.each(gates)('hides %s when the question has not been answered', stepName => {
      expect(isShown(stepName, makeReq())).toBe(false);
    });
  });

  it('only reads answers saved for the case in the route', () => {
    const req = {
      params: { caseReference: CASE_REF },
      session: {
        formData: { '9999999999999999': { 'have-tenancy-agreement': { copyOfTenancyAgreement: 'Yes' } } },
      },
    } as unknown as Request;

    expect(isShown('upload-tenancy-agreement', req)).toBe(false);
  });
});
