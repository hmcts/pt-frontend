import type { NextFunction, Request, Response } from 'express';

import * as flowModule from '../../../../../main/modules/steps/flow';
import { FormFieldConfig } from '../../../../../main/modules/steps/formBuilder/formFieldConfig.interface';
import { createPostHandler } from '../../../../../main/modules/steps/formBuilder/postHandler';
import { JourneyFlowConfig } from '../../../../../main/modules/steps/stepFlow.interface';
import { CcdCaseModel } from '../../../../../main/services/ccdCaseData.model';

jest.mock('@modules/i18n');
jest.mock('../../../../../main/modules/steps/flow');
jest.mock('@services/ccdApiClient', () => {
  const updateCaseMock = jest.fn();

  return {
    getCaseApi: jest.fn(() => ({
      updateCase: updateCaseMock,
    })),
    __getEventTriggerMock: updateCaseMock, // expose it for the test
  };
});

const { getCaseApi: getCaseApiMock, __getEventTriggerMock: updateCaseMock } =
  jest.requireMock('@services/ccdApiClient');

const flowConfig: JourneyFlowConfig = {
  stepOrder: [],
  steps: {},
};

const CASE_REF = '1234123412341234';

describe('PostHandler - Save for Later Fix', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let fields: FormFieldConfig[];

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: { caseReference: CASE_REF },
      session: {
        ccdCase: {
          caseReference: 1234123412341234n,
          createdDate: '2026-05-08T14:04:16.801467',
        },
        formData: {
          [CASE_REF]: {
            'text-updates': {
              textUpdates: 'Yes',
              'textUpdates.textUpdatesPhoneNumber': '+447777777777',
            },
            'contact-by-phone': {
              phoneNumberForCalls: '07777777774',
            },
          },
        },
        user: {
          accessToken: 'test-token',
          idToken: 'test-id-token',
          refreshToken: 'test-refresh-token',
          sub: 'test-user-id',
        },
      },
      res: {
        locals: {
          validatedCase: { id: '1771325608502536' },
        },
      },
      app: {
        locals: {
          nunjucksEnv: {
            render: jest.fn(() => '<div>test</div>'),
          },
        },
      },
    } as unknown as Request;

    mockResponse = {
      redirect: jest.fn(),
      render: jest.fn(),
      status: jest.fn().mockReturnThis(),
      locals: {
        validatedCase: new CcdCaseModel({ id: '1771325608502536', data: {} }),
      },
    };

    mockNext = jest.fn();

    fields = [
      {
        name: 'hadLegalAdvice',
        type: 'radio',
        required: true,
        translationKey: { label: 'question' },
        options: [
          { value: 'yes', translationKey: 'options.yes' },
          { value: 'no', translationKey: 'options.no' },
        ],
      },
    ];

    // Mock translation function
    jest
      .spyOn(require('../../../../../main/modules/i18n'), 'getTranslationFunction')
      .mockReturnValue(jest.fn((key: string) => key));

    (flowModule.createStepNavigation as jest.Mock).mockReturnValue({
      getBackUrl: jest.fn().mockResolvedValue('/previous-step'),
      getNextStepUrl: jest.fn().mockResolvedValue('/next-step'),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Fix #3: Save for Later Functionality', () => {
    it('passes current step post payload to navigation for forward routing', async () => {
      const getNextStepUrl = jest.fn().mockResolvedValue('/case/1771325608502536/respond-to-claim/contact-preferences');
      (flowModule.createStepNavigation as jest.Mock).mockReturnValue({
        getBackUrl: jest.fn().mockResolvedValue('/previous-step'),
        getNextStepUrl,
      });

      const testFlowConfig: JourneyFlowConfig = {
        journeyName: 'respondToClaim',
        basePath: '/case/:caseReference/respond-to-claim',
        stepOrder: ['free-legal-advice', 'contact-preferences'],
        steps: {
          'free-legal-advice': {
            defaultNext: 'contact-preferences',
          },
        },
      };

      const { post } = createPostHandler(fields, 'free-legal-advice', 'test.njk', 'respondToClaim', testFlowConfig);

      mockRequest.body = {
        hadLegalAdvice: 'yes',
      };

      await post(mockRequest as unknown as Request, mockResponse as Response, mockNext);

      expect(getNextStepUrl).toHaveBeenCalledWith(
        mockRequest,
        'free-legal-advice',
        expect.objectContaining({ hadLegalAdvice: 'yes' })
      );
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        303,
        '/case/1771325608502536/respond-to-claim/contact-preferences'
      );
    });

    it('resolves navigation flow config from the supplied resolver', async () => {
      const resolvedFlowConfig: JourneyFlowConfig = {
        journeyName: 'respondToClaim',
        stepOrder: ['free-legal-advice', 'legalrep-next'],
        steps: {
          'free-legal-advice': { defaultNext: 'legalrep-next' },
        },
      };

      createPostHandler(fields, 'free-legal-advice', 'test.njk', 'respondToClaim', () => resolvedFlowConfig);

      const createStepNavigationCalls = (flowModule.createStepNavigation as jest.Mock).mock.calls;
      const flowConfigResolver = createStepNavigationCalls[createStepNavigationCalls.length - 1][0] as (
        req: Request
      ) => Promise<JourneyFlowConfig>;

      await expect(flowConfigResolver(mockRequest as Request)).resolves.toBe(resolvedFlowConfig);
    });

    it('uses request-resolved flow config for session form data persistence', async () => {
      const { post } = createPostHandler(fields, 'free-legal-advice', 'test.njk', 'respondToClaim', () => ({
        ...flowConfig,
        useSessionFormData: false,
      }));

      mockRequest.body = {
        hadLegalAdvice: 'yes',
      };
      mockRequest.res = {
        locals: {
          validatedCase: { id: '1771325608502536' },
        },
      } as unknown as Response;

      await post(mockRequest as unknown as Request, mockResponse as Response, mockNext);

      expect(
        (mockRequest.session as { formData?: Record<string, Record<string, unknown>> } | undefined)?.formData?.[
          CASE_REF
        ]?.['free-legal-advice']
      ).toBeUndefined();
      expect(mockResponse.redirect).toHaveBeenCalledWith(303, '/next-step');
    });

    it('bypasses validation on saveForLater and redirects', async () => {
      const { post } = createPostHandler(fields, 'free-legal-advice', 'test.njk', 'respondToClaim', flowConfig);
      mockRequest.body = { action: 'saveForLater' };

      await post(mockRequest as unknown as Request, mockResponse as Response, mockNext);

      expect(mockResponse.render).not.toHaveBeenCalled();
      expect(mockResponse.redirect).toHaveBeenCalled();
    });

    it('should save valid data and redirect to dashboard', async () => {
      const mockBeforeRedirect = jest.fn().mockResolvedValue(undefined);
      const { post } = createPostHandler(
        fields,
        'contact-by-phone',
        'contactByPhone.njk',
        'application',
        flowConfig,
        mockBeforeRedirect
      );

      // Valid form + save for later
      mockRequest.body = {
        phoneNumberForCalls: '07123456789',
        action: 'saveForLater',
      };

      await post(mockRequest as unknown as Request, mockResponse as Response, mockNext);

      expect(getCaseApiMock).toHaveBeenCalledTimes(1);
      expect(updateCaseMock).toHaveBeenCalledTimes(1);
      expect(updateCaseMock).toHaveBeenCalledWith('1234123412341234', {
        applicantContactPreferences: {
          phoneNumberForCalls: '07123456789',
          textUpdates: 'Yes',
          textUpdatesPhoneNumber: '+447777777777',
        },
      });

      // Should call beforeRedirect (save to CCD)
      expect(mockBeforeRedirect).toHaveBeenCalled();

      // Should redirect to dashboard
      expect(mockResponse.redirect).toHaveBeenCalledWith(303, '/');
    });

    it('writes to the case in the route, not the one cached in the session', async () => {
      // session.ccdCase is refreshed only by task-list, so on a page reached without going through
      // it the cached case is a *different* case than the one being edited. The route must win.
      const OTHER_CASE = '9999999999999999';
      mockRequest.params = { caseReference: OTHER_CASE };
      (mockRequest.session as unknown as { formData: Record<string, unknown> }).formData = {
        [OTHER_CASE]: { 'contact-by-phone': {} },
      };

      const { post } = createPostHandler(fields, 'contact-by-phone', 'contactByPhone.njk', 'application', flowConfig);
      mockRequest.body = { phoneNumberForCalls: '07123456789', action: 'saveForLater' };

      await post(mockRequest as unknown as Request, mockResponse as Response, mockNext);

      expect(updateCaseMock).toHaveBeenCalledWith(OTHER_CASE, expect.anything());
    });

    it('only sends the routed case answers to CCD, never another case in the same session', async () => {
      const OTHER_CASE = '9999999999999999';
      mockRequest.params = { caseReference: OTHER_CASE };
      (mockRequest.session as unknown as { formData: Record<string, unknown> }).formData = {
        // CASE_REF holds a completed contact-preferences section that must not leak into OTHER_CASE
        [CASE_REF]: {
          'text-updates': { textUpdates: 'Yes', 'textUpdates.textUpdatesPhoneNumber': '+447777777777' },
        },
        [OTHER_CASE]: {},
      };

      const { post } = createPostHandler(fields, 'contact-by-phone', 'contactByPhone.njk', 'application', flowConfig);
      mockRequest.body = { phoneNumberForCalls: '07123456789', action: 'saveForLater' };

      await post(mockRequest as unknown as Request, mockResponse as Response, mockNext);

      expect(updateCaseMock).toHaveBeenCalledWith(OTHER_CASE, {
        applicantContactPreferences: {
          phoneNumberForCalls: '07123456789',
          textUpdates: undefined,
          textUpdatesPhoneNumber: undefined,
        },
      });
    });

    it('404s rather than guessing when the route has no valid case reference', async () => {
      mockRequest.params = {};

      const { post } = createPostHandler(fields, 'contact-by-phone', 'contactByPhone.njk', 'application', flowConfig);
      mockRequest.body = { phoneNumberForCalls: '07123456789', action: 'saveForLater' };

      await post(mockRequest as unknown as Request, mockResponse as Response, mockNext);

      expect(updateCaseMock).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }));
    });

    it('clears only the routed case answers on save for later', async () => {
      const OTHER_CASE = '9999999999999999';
      mockRequest.params = { caseReference: OTHER_CASE };
      const formData: Record<string, unknown> = {
        [CASE_REF]: { 'text-updates': { textUpdates: 'Yes' } },
        [OTHER_CASE]: { 'contact-by-phone': { phoneNumberForCalls: '07123456789' } },
      };
      (mockRequest.session as unknown as { formData: Record<string, unknown> }).formData = formData;

      const { post } = createPostHandler(fields, 'contact-by-phone', 'contactByPhone.njk', 'application', flowConfig);
      mockRequest.body = { phoneNumberForCalls: '07123456789', action: 'saveForLater' };

      await post(mockRequest as unknown as Request, mockResponse as Response, mockNext);

      expect(formData[OTHER_CASE]).toBeUndefined();
      expect(formData[CASE_REF]).toEqual({ 'text-updates': { textUpdates: 'Yes' } });
    });

    it('should use case ID from res.locals.validatedCase', async () => {
      const { post } = createPostHandler(fields, 'free-legal-advice', 'test.njk', 'respondToClaim', flowConfig);

      mockRequest.body = {
        hadLegalAdvice: 'yes',
        action: 'saveForLater',
      };

      mockRequest.res = {
        locals: {
          validatedCase: { id: '9876543210987654' },
        },
      } as unknown as Response;

      await post(mockRequest as unknown as Request, mockResponse as Response, mockNext);

      expect(mockResponse.redirect).toHaveBeenCalledWith(303, '/');
    });

    it('should handle missing case ID gracefully', async () => {
      const { post } = createPostHandler(fields, 'free-legal-advice', 'test.njk', 'respondToClaim', flowConfig);

      mockRequest.body = {
        hadLegalAdvice: 'yes',
        action: 'saveForLater',
      };

      mockRequest.res = {
        locals: {}, // No validatedCase
      } as unknown as Response;

      await post(mockRequest as unknown as Request, mockResponse as Response, mockNext);

      // Should redirect to home when no valid case ID
      expect(mockResponse.redirect).toHaveBeenCalledWith(303, '/');
    });

    it('should save data to CCD via beforeRedirect', async () => {
      const mockBeforeRedirect = jest.fn().mockResolvedValue(undefined);
      const { post } = createPostHandler(
        fields,
        'free-legal-advice',
        'test.njk',
        'respondToClaim',
        flowConfig,
        mockBeforeRedirect
      );

      mockRequest.body = {
        hadLegalAdvice: 'yes',
        action: 'saveForLater',
      };

      await post(mockRequest as unknown as Request, mockResponse as Response, mockNext);

      expect(mockBeforeRedirect).toHaveBeenCalledWith(mockRequest);
    });

    it('should handle beforeRedirect errors gracefully', async () => {
      const mockBeforeRedirect = jest.fn().mockRejectedValue(new Error('CCD save failed'));
      const { post } = createPostHandler(
        fields,
        'free-legal-advice',
        'test.njk',
        'respondToClaim',
        flowConfig,
        mockBeforeRedirect
      );

      mockRequest.body = {
        hadLegalAdvice: 'yes',
        action: 'saveForLater',
      };

      await post(mockRequest as unknown as Request, mockResponse as Response, mockNext);

      // Should call next with error
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // Should NOT redirect
      expect(mockResponse.redirect).not.toHaveBeenCalled();
    });
  });
});
