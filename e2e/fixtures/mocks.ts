/**
 * Typed mock payload factories for Playwright smoke tests.
 *
 * Types come from orval-generated schemas (single source of truth, same doctrine
 * as the app code). No hand-rolled interfaces, no `any`, no casts.
 */
import type {
  InstalledApp,
  AppInstance,
  AppStatus,
  SystemInfo,
  Quest,
  QuestState,
  JobMeta,
} from '@generated/core/schemas';
import type { Product } from '@generated/console/schemas';

export const fixtures = {
  // Core API returns SystemInfo as the raw body — customInstance wraps it into { data, status, headers }.
  systemInfo: (override: Partial<SystemInfo> = {}): SystemInfo => ({
    arch: 'arm64',
    platform: 'Distroless',
    distro: { name: 'Distroless', version: 'N/A', codename: 'smoke', id: 'distroless' },
    kernel: { version: 'N/A', machine: 'arm64', build: '1' },
    ...override,
  }),

  installedApp: (override: Partial<InstalledApp> = {}): InstalledApp => ({
    appKey: { name: 'tech.flecs.fence', version: '0.3.0-rc.3' },
    status: 'installed' as AppStatus,
    desired: 'installed' as AppStatus,
    installedSize: 0,
    multiInstance: false,
    ...override,
  }),

  instance: (override: Partial<AppInstance> = {}): AppInstance => ({
    instanceId: '00000001',
    instanceName: 'default',
    appKey: { name: 'tech.flecs.fence', version: '0.3.0-rc.3' },
    status: 'running',
    desired: 'running',
    editors: [],
    ...override,
  }),

  // Minimal WooCommerce Product shape — orval generates this from console OpenAPI.
  product: (override: Partial<Product> = {}): Product => ({
    id: 1,
    name: 'Test App',
    short_description: 'Short description',
    description: 'Long description',
    price: '0',
    stock_status: 'instock',
    categories: [],
    attributes: [
      { id: 1, name: 'archs', options: ['arm64', 'amd64'] },
      { id: 2, name: 'reverse-domain-name', options: ['tech.flecs.testapp'] },
    ],
    meta_data: [],
    ...override,
  }),

  jobMeta: (jobId = 42): JobMeta => ({ jobId }),

  quest: (override: Partial<Quest> = {}): Quest => ({
    id: 42,
    description: 'Install app',
    state: 'finished-ok' as QuestState,
    ...override,
  }),
};
