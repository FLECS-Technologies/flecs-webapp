import React, { useState } from 'react';
import type { EnrichedApp, AppVersion, InstallerState } from '@features/apps/types';
import ContentDialog from '@app/components/ContentDialog';
import InstallationStepper from '@features/apps/components/installation/InstallationStepper';
import { RefreshCw } from 'lucide-react';
import type { Quest } from '@generated/core/schemas';
import MarqueeText from '@app/components/MarqueeText';

interface UpdateButtonProps {
  app: EnrichedApp;
  to: AppVersion;
  showSelectedVersion?: boolean;
  fullWidth?: boolean;
  fromVersion?: string;
  operation?: 'update' | 'downgrade';
}

export default function UpdateButton({
  app,
  to,
  showSelectedVersion = false,
  fullWidth,
  fromVersion,
  operation = 'update',
}: UpdateButtonProps): React.ReactElement {
  const [state, setState] = useState<{ updating: boolean; currentQuest: Quest | null }>({
    updating: false,
    currentQuest: null,
  });
  const [updateAppOpen, setUpdateAppOpen] = useState<boolean>(false);
  const action = operation === 'downgrade' ? 'Downgrade' : 'Update';
  return (
    <React.Fragment>
      <button
        className={`inline-flex cursor-pointer items-center gap-2 bg-accent font-semibold text-white transition hover:bg-accent/80 disabled:cursor-not-allowed disabled:opacity-50 ${fullWidth ? 'w-full justify-center rounded-xl px-4 py-3 text-base' : 'rounded-lg px-4 py-2'}`}
        onClick={() => setUpdateAppOpen(true)}
        data-testid="update-app-button"
        disabled={state.updating}
      >
        {state.updating ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <RefreshCw size={18} />
        )}
        {state.updating ? (
          <MarqueeText text={state.currentQuest?.description || `${action} in progress`} />
        ) : (
          `${action}${showSelectedVersion ? ` to ${to.version}` : ''}`
        )}
      </button>
      <ContentDialog
        open={updateAppOpen}
        setOpen={setUpdateAppOpen}
        title={`${action} ${app.title} to ${to.version}`}
      >
        <InstallationStepper
          app={app}
          version={to.version}
          update={true}
          fromVersion={fromVersion}
          onStateChange={(s: InstallerState) =>
            setState({
              updating: s.installing || (s.updating ?? false),
              currentQuest: s.currentQuest ?? null,
            })
          }
        />
      </ContentDialog>
    </React.Fragment>
  );
}
