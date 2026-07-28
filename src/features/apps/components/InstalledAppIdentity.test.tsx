import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AppInstance } from '@generated/core/schemas';
import type { EnrichedApp } from '@features/apps/types';
import InstalledAppIdentity from './InstalledAppIdentity';

describe('InstalledAppIdentity', () => {
  it('keeps the familiar instance identity without runtime status when requested', () => {
    const app: EnrichedApp = {
      appKey: { name: 'tech.flecs.node-red', version: '4.0.2' },
      title: 'Node-RED',
      author: 'FLECS',
    };
    const instance: AppInstance = {
      instanceId: 'production-id',
      instanceName: 'production',
      appKey: app.appKey,
      status: 'running',
      desired: 'running',
      editors: [],
    };

    render(
      <div>
        <InstalledAppIdentity
          app={app}
          instance={instance}
          instanceDisplayName="production"
          showStatus={false}
        />
      </div>,
    );

    expect(screen.getByText('Node-RED')).toBeInTheDocument();
    expect(screen.getByText(/production/)).toBeInTheDocument();
    expect(screen.getByText('FLECS')).toBeInTheDocument();
    expect(screen.getByText('4.0.2')).toBeInTheDocument();
    expect(screen.queryByText('Running')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
