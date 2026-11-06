import { Application, Request, Response } from 'express';
import type { TFunction } from 'i18next';

import { getTranslationFunction } from '@modules/i18n';
import { PTCaseData } from '@services/ccd/ccdCase.interface';
import { getPtApi } from '@services/ptApi/ptApiClient';
import { formatDate } from '@utils/date';

export default function (app: Application): void {
  app.get('/', async (req: Request, res: Response) => {
    if (req.session?.user) {
      const t = getTranslationFunction(req);
      const ptApi = getPtApi(req.session.user);
      const userApplicantApplications = await ptApi.getAllCasesByApplicantUser();
      const userRespondentApplications = await ptApi.getAllCasesByRespondentUser();

      const mappedUserApplicantApplications = populateApplicationsTable(userApplicantApplications, t);

      const mappedUserRespondentApplications = populateApplicationsTable(userRespondentApplications, t, true);

      res.render('myApplications', {
        applicationsAsApplicant: mappedUserApplicantApplications,
        applicationsAsLinkedRespondent: mappedUserRespondentApplications,
      });
    } else {
      res.redirect('/login');
    }
  });
}
//:caseReference/landlord-response/task-list

function populateApplicationsTable(
  applications: PTCaseData[],
  translationFn: TFunction,
  isRespondentApplicationsTable: boolean = false
) {
  return applications.map((application: PTCaseData) => {
    return [
      {
        html: `<a class="govuk-link govuk-link--no-visited-state" href="/${application.caseReference}${isRespondentApplicationsTable ? '/landlord-response' : ''}/task-list">${application.caseReference}</a>`,
      },
      {
        text: formatDate(application.createdDate),
      },
      {
        text:
          formatDate(application.submittedOn) ||
          translationFn('myApplicationsTable.notYetSubmitted', 'Not yet submitted'),
      },
      {
        text: 'In progress', //TODO: case STATE to be pulled from application object once HDPD-1410 completed
      },
    ];
  });
}
