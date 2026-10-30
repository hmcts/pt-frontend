import type { Request, Response } from 'express';

import { flowConfig } from '../../../../main/steps/landlord-response/flow.config';
import {
  LANDLORD_RESPONSE_SECTION_GROUPS,
  landlordResponseSections,
} from '../../../../main/steps/landlord-response/sections.config';
import { stepRegistry } from '../../../../main/steps/landlord-response/stepRegistry';
import { step } from '../../../../main/steps/landlord-response/task-list';

import type { GetController } from '@modules/steps';
import type { SectionStatus } from '@modules/steps/stepFlow.interface';
import { getPtApi } from '@services/ptApi/ptApiClient';
import { getAllSectionStatuses, getFirstVisibleStep } from '@services/sectionStatus';

jest.mock('@modules/steps/i18n', () => ({
  ...jest.requireActual('@modules/steps/i18n'),
  getTranslationFunction: jest.fn(() => (key: string) => key),
}));

jest.mock('@services/ptApi/ptApiClient', () => ({ getPtApi: jest.fn() }));

jest.mock('@services/sectionStatus', () => ({
  ...jest.requireActual('@services/sectionStatus'),
  getAllSectionStatuses: jest.fn(),
  getFirstVisibleStep: jest.fn(),
}));

const { getFirstVisibleStep: realGetFirstVisibleStep } = jest.requireActual('@services/sectionStatus');

const CASE_REF = '1234123412341234';
const USER = { accessToken: 'token' };

type Item = { title: { text: string }; href?: string; status: { tag: { text: string; classes: string } } };
type Group = { id: string; number: number; title: string; items: Item[] };

describe('landlord-response task-list step', () => {
  const getCaseByCaseReference = jest.fn();

  const render = async (statuses: Record<string, SectionStatus> = {}, ccdCase: Record<string, unknown> = {}) => {
    getCaseByCaseReference.mockResolvedValue(ccdCase);
    (getAllSectionStatuses as jest.Mock).mockResolvedValue(new Map(Object.entries(statuses)));
    const req = { params: { caseReference: CASE_REF }, session: { user: USER } } as unknown as Request;
    const res = { render: jest.fn(), locals: {} } as unknown as Response;

    await (step.getController as () => GetController)().get(req, res);

    const [view, content] = (res.render as jest.Mock).mock.calls[0];
    return { req, view, content, groups: content.groups as Group[] };
  };

  const itemFor = (groups: Group[], titleKey: string) =>
    groups.flatMap(group => group.items).find(item => item.title.text === titleKey);

  beforeEach(() => {
    jest.clearAllMocks();
    (getPtApi as jest.Mock).mockReturnValue({ getCaseByCaseReference });
    (getFirstVisibleStep as jest.Mock).mockImplementation(realGetFirstVisibleStep);
  });

  it('loads the case into the session before working out section statuses', async () => {
    const ccdCase = { caseReference: CASE_REF };
    let caseWhenStatusesWorkedOut: unknown;
    getCaseByCaseReference.mockResolvedValue(ccdCase);
    (getAllSectionStatuses as jest.Mock).mockImplementation(async (_flow, _registry, statusReq: Request) => {
      caseWhenStatusesWorkedOut = statusReq.session.ccdCase;
      return new Map();
    });
    const req = { params: { caseReference: CASE_REF }, session: { user: USER } } as unknown as Request;
    const res = { render: jest.fn(), locals: {} } as unknown as Response;

    await (step.getController as () => GetController)().get(req, res);

    expect((res.render as jest.Mock).mock.calls[0][0]).toBe('landlord-response/task-list/taskList.njk');
    expect(getPtApi).toHaveBeenCalledWith(USER);
    expect(getCaseByCaseReference).toHaveBeenCalledWith(CASE_REF);
    expect(req.session.ccdCase).toBe(ccdCase);
    expect(getAllSectionStatuses).toHaveBeenCalledWith(flowConfig, stepRegistry, req);
    expect(caseWhenStatusesWorkedOut).toBe(ccdCase);
  });

  it.each([
    ['Jane Smith', { applicantFirstName: 'Jane', applicantLastName: 'Smith' }],
    ['Jane', { applicantFirstName: 'Jane' }],
    ['Applicant', {}],
  ])('greets the applicant as %s', async (name, ccdCase) => {
    const { content } = await render({}, ccdCase);

    expect(content).toEqual(expect.objectContaining({ name, backUrl: '/' }));
  });

  it('lists every group in order with its sections in declaration order', async () => {
    const { groups } = await render();

    expect(groups.map(({ id, number, title }) => ({ id, number, title }))).toEqual(
      LANDLORD_RESPONSE_SECTION_GROUPS.map((group, index) => ({
        id: group.id,
        number: index + 1,
        title: group.titleKey,
      }))
    );
    expect(groups.map(group => group.items.map(item => item.title.text))).toEqual(
      LANDLORD_RESPONSE_SECTION_GROUPS.map(group =>
        landlordResponseSections.filter(section => section.groupId === group.id).map(section => section.titleKey)
      )
    );
  });

  it.each([
    ['AVAILABLE', 'govuk-tag govuk-tag--blue'],
    ['IN_PROGRESS', 'govuk-tag govuk-tag--yellow'],
    ['DONE', 'govuk-tag govuk-tag--green'],
  ] as const)('links a section with status %s to its first page', async (status, classes) => {
    const { groups } = await render({ yourResponse: status });
    const firstPage = landlordResponseSections.find(section => section.id === 'yourResponse')?.steps[0];

    expect(itemFor(groups, 'taskList.yourResponse')).toEqual({
      title: { text: 'taskList.yourResponse' },
      href: `/${CASE_REF}/landlord-response/${firstPage}`,
      status: { tag: { text: `taskList.status.${status}`, classes } },
    });
  });

  it('shows a section that is not available yet without a link', async () => {
    const { groups } = await render({ tribunalsDetermination: 'NOT_AVAILABLE_YET' });

    expect(itemFor(groups, 'taskList.tribunalsDetermination')).toEqual({
      title: { text: 'taskList.tribunalsDetermination' },
      href: undefined,
      status: { tag: { text: 'taskList.status.NOT_AVAILABLE_YET', classes: 'govuk-tag govuk-tag--grey' } },
    });
  });

  it('leaves out a section that does not apply', async () => {
    const { groups } = await render({ yourResponse: 'NOT_APPLICABLE' });

    expect(groups.find(group => group.id === 'yourResponse')?.items).toEqual([]);
  });

  it('treats a section with no status as available', async () => {
    const { groups } = await render();

    expect(itemFor(groups, 'taskList.tenantsApplication')?.status.tag.text).toBe('taskList.status.AVAILABLE');
  });

  it('links each section to the page getFirstVisibleStep returns and drops the link when it returns none', async () => {
    (getFirstVisibleStep as jest.Mock).mockImplementation(section =>
      section.id === 'yourResponse' ? 'respond-to-tenants-application' : undefined
    );
    const { groups } = await render();

    expect(itemFor(groups, 'taskList.yourResponse')?.href).toBe(
      `/${CASE_REF}/landlord-response/respond-to-tenants-application`
    );
    expect(itemFor(groups, 'taskList.tribunalsDetermination')?.href).toBeUndefined();
  });
});
