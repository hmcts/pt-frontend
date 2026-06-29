import type { NextFunction, Request, Response } from 'express';

import * as flowModule from '../../../../../main/modules/steps/flow';
import { FormFieldConfig } from '../../../../../main/modules/steps/formBuilder/formFieldConfig.interface';
import { createPostHandler } from '../../../../../main/modules/steps/formBuilder/postHandler';
import { JourneyFlowConfig } from '../../../../../main/modules/steps/stepFlow.interface';
import { CcdCaseModel } from '../../../../../main/services/ccdCaseData.model';

jest.mock('@modules/i18n');
jest.mock('../../../../../main/modules/steps/flow');

const flowConfig: JourneyFlowConfig = {
  stepOrder: [],
  steps: {},
};

describe('PostHandler - Save for Later Fix', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let fields: FormFieldConfig[];

  beforeEach(() => {
    mockRequest = {
      body: {},
      session: {
        formData: {},
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
        (mockRequest.session as { formData?: Record<string, unknown> } | undefined)?.formData?.['free-legal-advice']
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
        'free-legal-advice',
        'test.njk',
        'respondToClaim',
        flowConfig,
        mockBeforeRedirect
      );

      // Valid form + save for later
      mockRequest.body = {
        hadLegalAdvice: 'yes',
        action: 'saveForLater',
      };

      await post(mockRequest as unknown as Request, mockResponse as Response, mockNext);

      // Should save to session
      expect(
        (mockRequest.session as { formData?: Record<string, unknown> } | undefined)?.formData?.['free-legal-advice']
      ).toEqual({
        hadLegalAdvice: 'yes',
      });

      // Should call beforeRedirect (save to CCD)
      expect(mockBeforeRedirect).toHaveBeenCalled();

      // Should redirect to dashboard
      expect(mockResponse.redirect).toHaveBeenCalledWith(303, '/');
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
