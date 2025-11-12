/**
 * Comprehensive mock for @flecs/core-client-ts
 * This provides a centralized way to mock all API calls
 * Using Vitest mocking functions
 */
import { vi } from 'vitest';

// Mock quest responses
export const createMockQuest = (overrides = {}) => ({
  data: {
    jobId: Math.floor(Math.random() * 10000),
    ...overrides,
  },
});

// Mock Quest object for Quest API
export const createMockQuestObject = (overrides = {}) => ({
  id: Math.floor(Math.random() * 10000),
  state: 'pending',
  description: 'Mock quest',
  result: null,
  subquests: [],
  ...overrides,
});

export const createMockQuestResult = (overrides = {}) => ({
  state: 'finished-ok',
  description: 'Success',
  result: 'mock-result',
  ...overrides,
});

// Mock API responses
export const createMockApp = (overrides = {}) => ({
  appKey: {
    name: 'test-app',
    version: '1.0.0',
  },
  title: 'Test App',
  description: 'A test application',
  ...overrides,
});

export const createMockInstance = (overrides = {}) => ({
  instanceId: 'test-instance-id',
  instanceName: 'test-instance',
  appKey: {
    name: 'test-app',
    version: '1.0.0',
  },
  status: 'running',
  ...overrides,
});

// Comprehensive API mock
export const createMockApi = (customMocks = {}) => {
  const defaultMocks = {
    // App API
    app: {
      appsInstallPost: vi.fn(() => Promise.resolve(createMockQuest())),
      appsSideloadPost: vi.fn(() => Promise.resolve(createMockQuest())),
      appsUninstallDelete: vi.fn(() => Promise.resolve(createMockQuest())),
      appsAppDelete: vi.fn(() => Promise.resolve(createMockQuest())),
      appsGet: vi.fn(() => Promise.resolve({ data: [] })),
      appsAppKeyGet: vi.fn(() => Promise.resolve({ data: createMockApp() })),
    },

    // Instance API
    instances: {
      instancesCreatePost: vi.fn(() => Promise.resolve(createMockQuest())),
      instancesInstanceIdStartPost: vi.fn(() => Promise.resolve(createMockQuest())),
      instancesInstanceIdStopPost: vi.fn(() => Promise.resolve(createMockQuest())),
      instancesInstanceIdDelete: vi.fn(() => Promise.resolve(createMockQuest())),
      instancesGet: vi.fn(() => Promise.resolve({ data: [] })),
      instancesInstanceIdGet: vi.fn(() => Promise.resolve({ data: createMockInstance() })),
      instancesInstanceIdConfigGet: vi.fn(() => Promise.resolve({ data: {} })),
      instancesInstanceIdConfigPut: vi.fn(() => Promise.resolve({ data: {} })),
      instancesInstanceIdConfigPortsGet: vi.fn(() =>
        Promise.resolve({
          data: { tcp: [], udp: [] },
        }),
      ),
      instancesInstanceIdConfigPortsTransportProtocolPut: vi.fn(() =>
        Promise.resolve({ data: {} }),
      ),
      instancesInstanceIdConfigDevicesUsbGet: vi.fn(() => Promise.resolve({ data: {} })),
      instancesInstanceIdConfigDevicesUsbPortPut: vi.fn(() => Promise.resolve({ data: {} })),
      instancesInstanceIdConfigDevicesUsbPortDelete: vi.fn(() => Promise.resolve({ data: {} })),
      instancesInstanceIdConfigEnvironmentGet: vi.fn(() => Promise.resolve({ data: {} })),
      instancesInstanceIdConfigEnvironmentPut: vi.fn(() => Promise.resolve({ data: {} })),
      instancesInstanceIdConfigEnvironmentVariableNameDelete: vi.fn(() =>
        Promise.resolve({ data: {} }),
      ),
      instancesInstanceIdConfigEditorsGet: vi.fn(() => Promise.resolve({ data: [] })),
      instancesInstanceIdConfigEditorsPortPathPrefixDelete: vi.fn(() =>
        Promise.resolve({ data: {} }),
      ),
      instancesInstanceIdConfigNetworksGet: vi.fn(() => Promise.resolve({ data: [] })),
      instancesInstanceIdConfigNetworksPost: vi.fn(() => Promise.resolve({ data: {} })),
      instancesInstanceIdConfigNetworksNetworkIdDelete: vi.fn(() => Promise.resolve({ data: {} })),
      instancesInstanceIdConfigEditorsPortPathPrefixPut: vi.fn(() => Promise.resolve({ data: {} })),
      instancesInstanceIdLogsGet: vi.fn(() =>
        Promise.resolve({ data: 'Mock log content\nLine 2 of logs\nLine 3 of logs' }),
      ),
    },

    // Marketplace API
    marketplace: {
      marketplaceAppsGet: vi.fn(() => Promise.resolve({ data: [] })),
      marketplaceAppsAppKeyGet: vi.fn(() => Promise.resolve({ data: createMockApp() })),
    },

    // System API
    system: {
      systemInfoGet: vi.fn(() => Promise.resolve({ data: {} })),
      systemJobsGet: vi.fn(() => Promise.resolve({ data: [] })),
      systemJobsJobIdGet: vi.fn(() => Promise.resolve({ data: createMockQuestResult() })),
      systemDevicesUsbGet: vi.fn(() => Promise.resolve({ data: [] })),
      systemNetworkAdaptersGet: vi.fn(() => Promise.resolve({ data: [] })),
      systemPingGet: vi.fn(() => Promise.resolve({ data: { status: 'ok' } })),
      systemVersionGet: vi.fn(() =>
        Promise.resolve({ data: { version: '1.0.0', build: 'test-build' } }),
      ),
    },

    // Deployments API
    deployments: {
      deploymentsDeploymentIdNetworksGet: vi.fn(() => Promise.resolve({ data: [] })),
      deploymentsDeploymentIdNetworksPost: vi.fn(() => Promise.resolve({ data: {} })),
      deploymentsDeploymentIdNetworksNetworkIdDhcpIpv4Post: vi.fn(() =>
        Promise.resolve({ data: {} }),
      ),
    },

    // Device API
    device: {
      deviceInfoGet: vi.fn(() => Promise.resolve({ data: {} })),
      deviceNetworkGet: vi.fn(() => Promise.resolve({ data: {} })),
      deviceLicenseActivationStatusGet: vi.fn(() => Promise.resolve({ data: { isValid: true } })),
      deviceLicenseInfoGet: vi.fn(() =>
        Promise.resolve({ data: { license: 'mock-license-info' } }),
      ),
      deviceOnboardingPost: vi.fn(() =>
        Promise.resolve({
          data: { jobId: 'test-job-id' },
        }),
      ),
    },

    // User API
    user: {
      userProfileGet: vi.fn(() => Promise.resolve({ data: {} })),
      userProfilePut: vi.fn(() => Promise.resolve({ data: {} })),
    },

    // License API
    license: {
      licenseGet: vi.fn(() => Promise.resolve({ data: {} })),
      licensePut: vi.fn(() => Promise.resolve({ data: {} })),
    },

    // Quest API
    quests: {
      questsGet: vi.fn(() => Promise.resolve({ data: [] })),
      questsIdGet: vi.fn(() => Promise.resolve({ data: createMockQuestObject() })),
      questsIdDelete: vi.fn(() => Promise.resolve({ data: {} })),
    },

    // Export API
    export: {
      exportsGet: vi.fn(() => Promise.resolve({ data: [] })),
      exportsExportIdGet: vi.fn(() => Promise.resolve({ data: new Blob(['test content']) })),
      exportsExportIdDelete: vi.fn(() => Promise.resolve({ data: {} })),
      importsPost: vi.fn(() => Promise.resolve(createMockQuest())),
    },

    // Authentication API
    authentication: {
      authProvidersDefaultProtocolGet: vi.fn(() => Promise.resolve({ data: 'oidc' })),
      authProvidersDefaultLocationGet: vi.fn(() =>
        Promise.resolve({ data: 'http://localhost:8080/auth' }),
      ),
    },

    // Console API
    console: {
      consoleAuthenticationPut: vi.fn(() => Promise.resolve({ data: {} })),
    },

    // Providers API (ExperimentalApi)
    providers: {
      // Auth provider endpoints
      getProvidersAuth: vi.fn(() =>
        Promise.resolve({
          status: 200,
          data: {
            providers: {
              'flecs-auth': { name: 'FLECS Auth', description: 'Built-in FLECS authentication' },
            },
            core: null,
          },
        }),
      ),
      getProvidersAuthCore: vi.fn(() =>
        Promise.resolve({
          status: 200,
          data: { provider: 'flecs-auth' },
        }),
      ),
      putProvidersAuthCore: vi.fn(() =>
        Promise.resolve({
          status: 200,
          data: { provider: 'flecs-auth' },
        }),
      ),
      postProvidersAuthFirstTimeSetupFlecsport: vi.fn(() =>
        Promise.resolve({
          status: 200,
          data: { jobId: 1, message: 'First-time setup initiated' },
        }),
      ),

      // Other provider endpoints
      getProvidersMarketplace: vi.fn(() => Promise.resolve({ status: 200, data: [] })),
      postProvidersMarketplace: vi.fn(() => Promise.resolve({ status: 201, data: {} })),
      putProvidersMarketplace: vi.fn(() => Promise.resolve({ status: 200, data: {} })),
      deleteProvidersMarketplace: vi.fn(() => Promise.resolve({ status: 204 })),
    },
  };

  // Deep merge custom mocks with defaults
  const mergeDeep = (target: any, source: any): any => {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        target[key] = target[key] || {};
        mergeDeep(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  };

  return mergeDeep(defaultMocks, customMocks);
};

// Mock the entire @flecs/core-client-ts module
export const mockCoreClientTs = () => ({
  Configuration: vi.fn(() => ({
    basePath: 'http://localhost:8080',
    accessToken: 'mock-token',
  })),

  // API Classes
  AppsApi: vi.fn(() => createMockApi().app),
  InstancesApi: vi.fn(() => createMockApi().instances),
  MarketplaceApi: vi.fn(() => createMockApi().marketplace),
  SystemApi: vi.fn(() => createMockApi().system),
  DeviceApi: vi.fn(() => createMockApi().device),
  UserApi: vi.fn(() => createMockApi().user),
  LicenseApi: vi.fn(() => createMockApi().license),
  ExperimentalApi: vi.fn(() => createMockApi().providers),
  ConsoleApi: vi.fn(() => createMockApi().console),
  DeploymentsApi: vi.fn(() => createMockApi().deployments),
  FlecsportApi: vi.fn(() => createMockApi().export),
  JobsApi: vi.fn(() => createMockApi().system), // Jobs are part of system API
  QuestsApi: vi.fn(() => createMockApi().quests),

  // Enums and Types
  TransportProtocol: {
    Tcp: 'Tcp',
    Udp: 'Udp',
  },

  // Common types for TypeScript
  AppKey: {},
  Instance: {},
  Job: {},
});

// Helper to reset all mocks
export const resetAllApiMocks = (api: any) => {
  Object.values(api).forEach((apiGroup) => {
    if (apiGroup && typeof apiGroup === 'object') {
      Object.values(apiGroup).forEach((fn) => {
        if (vi.isMockFunction(fn)) {
          vi.clearAllMocks();
        }
      });
    }
  });
};

// Helper to setup quest failure scenarios
export const setupQuestFailure = (api: any, method: any, error = 'Mock error') => {
  const quest = createMockQuest();
  const result = createMockQuestResult({
    state: 'finished-error',
    description: error,
  });

  // Mock the API call to return a quest
  method.mockResolvedValue(quest);

  // You'll need to mock the quest context to return the error result
  return { quest, result };
};

// Helper to setup auth provider scenarios
export const setupAuthProviderConfigured = (
  api: any,
  isConfigured = true,
  providerName = 'flecs-auth',
) => {
  if (isConfigured) {
    api.providers.getProvidersAuthCore.mockResolvedValue({
      status: 200,
      data: { provider: providerName },
    });
    api.providers.getProvidersAuth.mockResolvedValue({
      status: 200,
      data: {
        providers: {
          [providerName]: { name: 'FLECS Auth', description: 'Built-in FLECS authentication' },
        },
        core: providerName,
      },
    });
  } else {
    api.providers.getProvidersAuthCore.mockRejectedValue({
      status: 404,
      message: 'No core provider configured',
    });
    api.providers.getProvidersAuth.mockResolvedValue({
      status: 200,
      data: {
        providers: {},
        core: null,
      },
    });
  }
};

// Helper to setup auth provider selection scenarios
export const setupAuthProviderSelection = (
  api: any,
  providers: string[] = ['flecs-auth'],
  selectedProvider?: string,
) => {
  const providersData = providers.reduce((acc, provider) => {
    acc[provider] = { name: provider.replace('-', ' '), description: `${provider} authentication` };
    return acc;
  }, {} as any);

  api.providers.getProvidersAuth.mockResolvedValue({
    status: 200,
    data: {
      providers: providersData,
      core: selectedProvider || null,
    },
  });

  if (selectedProvider) {
    api.providers.putProvidersAuthCore.mockResolvedValue({
      status: 200,
      data: { provider: selectedProvider },
    });
  }
};

// Helper to setup first-time setup scenarios
export const setupFirstTimeSetup = (api: any, shouldSucceed = true) => {
  if (shouldSucceed) {
    api.providers.postProvidersAuthFirstTimeSetupFlecsport.mockResolvedValue({
      status: 200,
      data: { jobId: 1, message: 'First-time setup initiated' },
    });
  } else {
    api.providers.postProvidersAuthFirstTimeSetupFlecsport.mockRejectedValue(
      new Error('First-time setup failed'),
    );
  }
};

export default mockCoreClientTs;
