import type { NextFunction, Request, Response } from 'express';
import { TFunction } from 'i18next';

import { getFlowConfigForJourney } from '../../index';
import { PRE_APPLICATION_ROUTE, flowConfig } from '../flow.config';

import { createGetController, createStepNavigation, loadStepNamespace, setFormData } from '@modules/steps';
import type { StepDefinition } from '@modules/steps/stepFormData.interface';
import { isValidPostcode } from '@utils/postcode';

const journeyName = 'preApplication';
const stepName = 'address-of-property';
const templatePath = 'pre-application/address-of-property/addressOfProperty.njk';
const stepNavigation = createStepNavigation(() => getFlowConfigForJourney(journeyName) || flowConfig);

export const step: StepDefinition = {
  url: `${PRE_APPLICATION_ROUTE}/address-of-property`,
  name: stepName,
  view: templatePath,
  stepDir: __dirname,
  getController: () => {
    return createGetController(templatePath, stepName, stepNavigation);
  },
  postController: {
    post: async (req: Request, res: Response, next: NextFunction) => {
      const addressPostcode = req.body.addressPostcode as string | undefined;

      if (!addressPostcode || !isValidPostcode(addressPostcode)) {
        await loadStepNamespace(req);
        const getController = typeof step.getController === 'function' ? step.getController() : step.getController;
        let pageContent: Record<string, unknown> = {};
        const captureRes = {
          render: (_view: string, content: Record<string, unknown>) => {
            pageContent = content;
          },
        } as Response;

        await getController.get(req, captureRes, next);

        const t = pageContent.t as TFunction;
        const errorKey = !addressPostcode ? 'errors.addressPostcode.required' : 'errors.addressPostcode.invalid';
        const errorMessage = t(errorKey);

        return res.render(templatePath, {
          ...pageContent,
          errorSummary: [{ text: errorMessage, href: '#addressPostcode' }],
          errors: {
            addressPostcode: {
              msg: errorMessage,
            },
          },
        });
      }

      setFormData(req, stepName, {
        addressPostcode,
      });

      req.session.lastVisitedStep = stepName;

      const redirectPath = await stepNavigation.getNextStepUrl(req, stepName);

      if (!redirectPath) {
        return res.status(404).render('not-found');
      }

      res.redirect(303, redirectPath);
    },
  },
};
