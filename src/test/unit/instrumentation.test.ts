const mockCalls: string[] = [];
const mockPropertiesVolumeEnable = jest.fn(() => {
  mockCalls.push('propertiesVolume');
});
const mockAppInsightsEnable = jest.fn(() => {
  mockCalls.push('appInsights');
});

jest.mock('@modules/properties-volume', () => ({
  PropertiesVolume: jest.fn().mockImplementation(() => ({ enable: mockPropertiesVolumeEnable })),
}));

jest.mock('@modules/appinsights', () => ({
  AppInsights: jest.fn().mockImplementation(() => ({ enable: mockAppInsightsEnable })),
}));

const loadInstrumentation = (): void => {
  jest.isolateModules(() => {
    require('../../main/instrumentation');
  });
};

describe('instrumentation', () => {
  let exitSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCalls.length = 0;
    exitSpy = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null) => {
      throw new Error(`process.exit(${code})`);
    });
    stderrSpy = jest.spyOn(process.stderr, 'write').mockReturnValue(true);
  });

  afterEach(() => {
    exitSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  test('loads secrets before starting App Insights, so the connection string is available', () => {
    loadInstrumentation();

    expect(mockCalls).toEqual(['propertiesVolume', 'appInsights']);
    expect(exitSpy).not.toHaveBeenCalled();
    expect(stderrSpy).not.toHaveBeenCalled();
  });

  test('exits with code 1 and reports the stack when a secret is missing', () => {
    const error = new Error('Required secret not present in the properties volume: secrets.pt-kv1.pt-session-secret');
    mockPropertiesVolumeEnable.mockImplementationOnce(() => {
      throw error;
    });

    expect(loadInstrumentation).toThrow('process.exit(1)');

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(stderrSpy).toHaveBeenCalledWith(
      `Failed to start server: could not load secrets from the properties volume\n${error.stack}\n`
    );
    expect(mockAppInsightsEnable).not.toHaveBeenCalled();
  });

  test('falls back to the message when the error has no stack', () => {
    const error = new Error('Required secret not present in the properties volume: secrets.pt-kv1.pt-session-secret');
    error.stack = undefined;
    mockPropertiesVolumeEnable.mockImplementationOnce(() => {
      throw error;
    });

    expect(loadInstrumentation).toThrow('process.exit(1)');

    expect(stderrSpy).toHaveBeenCalledWith(
      `Failed to start server: could not load secrets from the properties volume\n${error.message}\n`
    );
  });

  test('reports a thrown value that is not an Error', () => {
    mockPropertiesVolumeEnable.mockImplementationOnce(() => {
      throw 'volume not mounted';
    });

    expect(loadInstrumentation).toThrow('process.exit(1)');

    expect(stderrSpy).toHaveBeenCalledWith(
      'Failed to start server: could not load secrets from the properties volume\nvolume not mounted\n'
    );
    expect(mockAppInsightsEnable).not.toHaveBeenCalled();
  });
});
