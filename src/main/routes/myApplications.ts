import { Application, Request, Response } from 'express';

import { getTranslationFunction } from '@modules/i18n';
import { PTCaseData } from '@services/ccdCase.interface';
import { getPtApi } from '@services/ptApi/ptApiClient';
import { formatDate } from '@utils/date';

export default function (app: Application): void {
  app.get('/', async (req: Request, res: Response) => {
    if (req.session?.user) {
      const t = getTranslationFunction(req);
      const ptApi = getPtApi(req.session.user);
      const userApplications = await ptApi.getAllCasesByUser();

      const mappedUserApplications = userApplications.map((application: PTCaseData) => {
        return [
          {
            html: `<a class="govuk-link govuk-link--no-visited-state" href="/${application.caseReference}/task-list">${application.caseReference}</a>`,
          },
          {
            text: formatDate(application.createdDate),
          },
          {
            text: formatDate(application.submittedOn) || t('myApplicationsTable.notYetSubmitted', 'Not yet submitted'),
          },
          {
            text: 'In progress', //TODO: case STATE to be pulled from application object once HDPD-1410 completed
          },
        ];
      });

      res.render('myApplications', {
        applications: mappedUserApplications,
      });
    } else {
      res.redirect('/login');
    }
  });
}
