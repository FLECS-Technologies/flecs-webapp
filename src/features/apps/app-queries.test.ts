import { describe, expect, it } from 'vitest';
import type { AppInstance, InstalledApp } from '@generated/core/schemas';
import { enrichInstalledApps, type MarketplaceProduct } from './app-queries';

describe('enrichInstalledApps', () => {
  it('shares marketplace identity and exact-version instances across installed-app surfaces', () => {
    const app: InstalledApp = {
      appKey: { name: 'tech.flecs.node-red', version: '4.0.2' },
      status: 'installed',
      desired: 'installed',
      installedSize: 1024,
      multiInstance: true,
    };
    const otherVersionInstance: AppInstance = {
      instanceId: 'other-version',
      instanceName: 'old',
      appKey: { name: app.appKey.name, version: '3.1.0' },
      status: 'stopped',
      desired: 'stopped',
      editors: [],
    };
    const matchingInstance: AppInstance = {
      instanceId: 'production',
      instanceName: 'production',
      appKey: app.appKey,
      status: 'running',
      desired: 'running',
      editors: [],
    };
    const product: MarketplaceProduct = {
      id: 1,
      name: 'Node-RED',
      short_description: '',
      description: '',
      price: '0',
      stock_status: 'instock',
      categories: [],
      attributes: [
        { id: 1, name: 'reverse-domain-name', options: [app.appKey.name] },
        { id: 2, name: 'versions', options: ['4.1.0', '4.0.2'] },
      ],
      meta_data: [{ id: 1, name: 'port-author-name', value: 'FLECS' }],
    };

    const [enriched] = enrichInstalledApps(
      [product],
      [app],
      [matchingInstance, otherVersionInstance],
    );

    expect(enriched.title).toBe('Node-RED');
    expect(enriched.author).toBe('FLECS');
    expect(enriched.instances).toEqual([matchingInstance]);
    expect(enriched.installedVersions).toEqual(['4.0.2']);
    expect(enriched.versions).toEqual([
      { version: '4.1.0', installed: false },
      { version: '4.0.2', installed: true },
    ]);
  });
});
