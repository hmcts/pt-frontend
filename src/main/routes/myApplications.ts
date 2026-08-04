import { Application, Request, Response } from 'express';

import { getPtApi } from '../services/ptApi/ptApiClient';

import { ApplicationData } from '@services/ccdCase.interface';
import { formatDate } from '@utils/date';

export default function (app: Application): void {
  app.get('/', async (req: Request, res: Response) => {
    if (req.session?.user) {
      const ptApi = getPtApi(req.session.user);
      const userApplications = await ptApi.getAllCasesByUser();

      const mappedUserApplications = userApplications.map((application: ApplicationData) => {
        return [
          {
            html: `<a class="govuk-link govuk-link--no-visited-state" href="/${application.caseReference}/task-list">${application.caseReference}</a>`,
          },
          {
            text: formatDate(application.createdDate),
          },
          {
            text: application.submittedOn || 'Not yet submitted',
          },
          {
            text: 'In progress', //TODO: update status once we know what other status' are
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
