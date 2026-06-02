/**
 * flattenEditors — unit tests for the sidebar editor derivation.
 */
import { describe, it, expect } from 'vitest';
import { flattenEditors } from './editor-nav';
import type { EnrichedApp } from './types';
import type { AppInstance, InstanceStatus } from '@generated/core/schemas';

function makeInstance(overrides: Partial<AppInstance> = {}): AppInstance {
  return {
    instanceId: 'abc123',
    instanceName: 'Instance 1',
    appKey: { name: 'tech.flecs.node-red', version: '1.0.0' },
    status: 'running' as InstanceStatus,
    desired: 'running' as InstanceStatus,
    editors: [{ name: '', port: 1880, url: '/v2/instances/abc123/editor/1880' }],
    ...overrides,
  };
}

function makeApp(overrides: Partial<EnrichedApp> = {}): EnrichedApp {
  return {
    appKey: { name: 'tech.flecs.node-red', version: '1.0.0' },
    title: 'Node-RED',
    avatar: 'https://example.com/icon.png',
    instances: [makeInstance()],
    ...overrides,
  };
}

describe('flattenEditors', () => {
  it('returns empty for undefined or empty app list', () => {
    expect(flattenEditors(undefined)).toEqual([]);
    expect(flattenEditors([])).toEqual([]);
  });

  it('maps a running instance editor to a labeled nav item', () => {
    expect(flattenEditors([makeApp()])).toEqual([
      {
        key: 'abc123:1880',
        label: 'Node-RED',
        avatar: 'https://example.com/icon.png',
        url: '/v2/instances/abc123/editor/1880',
      },
    ]);
  });

  it('prefers the manifest editor name over the app title', () => {
    const app = makeApp({
      instances: [
        makeInstance({
          editors: [{ name: 'Flow Editor', port: 1880, url: '/v2/instances/abc123/editor/1880' }],
        }),
      ],
    });
    expect(flattenEditors([app])[0].label).toBe('Flow Editor');
  });

  it('excludes instances that are not running', () => {
    const app = makeApp({
      instances: [makeInstance({ status: 'stopped' as InstanceStatus })],
    });
    expect(flattenEditors([app])).toEqual([]);
  });

  it('excludes running instances without editors', () => {
    const app = makeApp({ instances: [makeInstance({ editors: [] })] });
    expect(flattenEditors([app])).toEqual([]);
  });

  it('falls back to appKey.name when no marketplace title exists', () => {
    const app = makeApp({ title: undefined, avatar: undefined });
    expect(flattenEditors([app])[0].label).toBe('tech.flecs.node-red');
  });

  it('appends instance name when an app has multiple running instances', () => {
    const app = makeApp({
      instances: [
        makeInstance({ instanceId: 'aaa', instanceName: 'Line 1' }),
        makeInstance({ instanceId: 'bbb', instanceName: 'Line 2' }),
      ],
    });
    expect(flattenEditors([app]).map((e) => e.label)).toEqual([
      'Node-RED · Line 1',
      'Node-RED · Line 2',
    ]);
  });

  it('distinguishes multiple editors by name, falling back to port when unnamed', () => {
    const app = makeApp({
      instances: [
        makeInstance({
          editors: [
            { name: 'Dashboard', port: 1880, url: '/v2/instances/abc123/editor/1880' },
            { name: '', port: 9000, url: '/v2/instances/abc123/editor/9000' },
          ],
        }),
      ],
    });
    expect(flattenEditors([app]).map((e) => e.label)).toEqual(['Dashboard', 'Node-RED · :9000']);
  });

  it('sorts items alphabetically by label', () => {
    const apps = [
      makeApp({ title: 'Zebra', instances: [makeInstance({ instanceId: 'z1' })] }),
      makeApp({ title: 'Alpha', instances: [makeInstance({ instanceId: 'a1' })] }),
    ];
    expect(flattenEditors(apps).map((e) => e.label)).toEqual(['Alpha', 'Zebra']);
  });
});
