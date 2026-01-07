import { App } from '../app';

export const mockApp: App = {
  app: 'com.my.app',
  appKey: {
    name: 'name',
    version: '1.0.0.0',
  },
  title: 'FLECS Test App 1',
  installedVersions: ['0.0.0.1'],
};

export const mockInstalledApp: App = {
  app: 'com.installed.app',
  appKey: {
    name: 'installed-app',
    version: '2.0.0',
  },
  title: 'Installed Test App',
  author: 'Test Author',
  description: 'This is a test installed application',
  installedVersions: ['1.0.0', '1.5.0', '2.0.0'],
  versions: ['1.0.0', '1.5.0', '2.0.0'],
  status: 'installed',
  avatar: 'https://example.com/avatar.png',
  requirement: ['amd64'],
  categories: [
    { id: 1, name: 'Development', slug: 'development' },
    { id: 2, name: 'Tools', slug: 'tools' },
  ],
  average_rating: '4.5',
  rating_count: 42,
  instances: [
    {
      id: 'instance-1',
      status: 'running',
      editors: [{ name: 'web-ui', url: 'http://localhost:8080' }],
    },
  ],
};

export const mockAvailableApp: App = {
  app: 'com.available.app',
  appKey: {
    name: 'available-app',
    version: '1.0.0',
  },
  title: 'Available Test App',
  author: 'Another Author',
  description: 'This is a test available application',
  installedVersions: [],
  versions: ['0.5.0', '0.9.0', '1.0.0'],
  status: 'available',
  avatar: 'https://example.com/avatar2.png',
  requirement: ['amd64'],
  categories: [{ id: 3, name: 'Utility', slug: 'utility' }],
  average_rating: '3.8',
  rating_count: 15,
};

export const mockUpdateAvailableApp: App = {
  app: 'com.update.app',
  appKey: {
    name: 'update-app',
    version: '2.0.0',
  },
  title: 'Update Available App',
  author: 'Update Author',
  description: 'This app has an update available',
  installedVersions: ['1.0.0'],
  versions: ['1.0.0', '1.5.0', '2.0.0'],
  status: 'installed',
  avatar: 'https://example.com/avatar3.png',
  requirement: ['amd64'],
  instances: [
    {
      id: 'instance-1',
      status: 'running',
      editors: [{ name: 'web-ui', url: 'http://localhost:8080' }],
    },
  ],
};

export const mockNotInstallableApp: App = {
  app: 'com.notinstallable.app',
  appKey: {
    name: 'notinstallable-app',
    version: '1.0.0',
  },
  title: 'Not Installable App',
  author: 'Test Author',
  description: 'This app is not installable on the current system',
  installedVersions: [],
  versions: ['1.0.0'],
  status: 'available',
  avatar: 'https://example.com/avatar4.png',
  requirement: ['arm64'], // Different from system arch
  categories: [],
};

// Edge case mocks for testing various scenarios
export const mockAppWithoutAuthor: App = {
  ...mockAvailableApp,
  author: undefined,
};

export const mockAppWithOneReview: App = {
  ...mockAvailableApp,
  rating_count: 1,
};

export const mockAppWithoutCategories: App = {
  ...mockAvailableApp,
  categories: undefined,
};

export const mockAppWithoutVersions: App = {
  ...mockAvailableApp,
  versions: [],
};

export const mockPurchasableApp: App = {
  ...mockAvailableApp,
  purchasable: true,
  price: '29.99',
  permalink: 'https://example.com/purchase',
};

export const mockFreeApp: App = {
  ...mockAvailableApp,
  purchasable: true,
  price: '0',
  permalink: 'https://example.com/purchase',
};

export const mockNotPurchasableApp: App = {
  ...mockAvailableApp,
  purchasable: false,
  price: '29.99',
};

export const mockAppWithoutDescription: App = {
  ...mockAvailableApp,
  description: undefined,
};

export const mockAppWithDocs: App = {
  ...mockAvailableApp,
  documentationUrl: 'https://example.com/docs',
};

export const mockAppWithoutRequirements: App = {
  ...mockAvailableApp,
  requirement: undefined,
};

export const mockAppWithoutRating: App = {
  ...mockAvailableApp,
  average_rating: undefined,
};

export const mockAppWithoutReviews: App = {
  ...mockAvailableApp,
  rating_count: 0,
};

export const mockInstalledAppNoInstances: App = {
  ...mockInstalledApp,
  instances: undefined,
};

export const mockAppWithEmptyCategories: App = {
  ...mockAvailableApp,
  categories: [],
};

export const mockMultiArchApp: App = {
  ...mockAvailableApp,
  requirement: ['amd64', 'arm64', 'armhf'],
};
