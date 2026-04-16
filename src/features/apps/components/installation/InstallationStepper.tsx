import type { EnrichedApp, InstallerState } from '@features/apps/types';
import AppInstaller from './AppInstaller';

interface InstallationStepperProps {
  app?: EnrichedApp;
  version?: string;
  sideload?: boolean;
  update?: boolean;
  onStateChange?: (state: InstallerState) => void;
}

export default function InstallationStepper({ app, version, sideload, update, onStateChange }: InstallationStepperProps) {
  const mode = sideload ? 'sideload' : update ? 'update' : 'install';
  return (
    <AppInstaller
      mode={mode}
      app={app}
      version={version || app?.appKey?.version}
      fromVersion={update ? app?.installedVersions?.[0] : undefined}
      onStateChange={onStateChange}
    />
  );
}
