import React, { useState } from 'react';
import type { EnrichedApp, AppVersion, InstallerState } from '@features/apps/types';
import ContentDialog from '@app/components/ContentDialog';
import InstallationStepper from '@features/apps/components/installation/InstallationStepper';
import { Download } from 'lucide-react';
import type { Quest } from '@generated/core/schemas';
import MarqueeText from '@app/components/MarqueeText';

interface InstallButtonProps {
  app: EnrichedApp;
  version: AppVersion | string;
  onInstallComplete?: (success: boolean, message: string, error?: string) => void;
  showSelectedVersion?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Server-derived install-in-progress flag (from the /apps + /quests caches). Unlike the
   *  local `state.installing` — which only reflects an install started in this component's
   *  lifetime — this survives unmount/remount (route switch, pagination, filtering), so the
   *  button keeps showing "Installing" after the user navigates away and back. */
  installing?: boolean;
  installingProgress?: number;
}

export default function InstallButton({
  app,
  version,
  onInstallComplete,
  showSelectedVersion = false,
  disabled,
  fullWidth,
  installing: installingProp = false,
  installingProgress,
}: InstallButtonProps): React.ReactElement {
  const [state, setState] = useState<{ installing: boolean; currentQuest: Quest | null }>({
    installing: false,
    currentQuest: null,
  });
  const [installAppOpen, setInstallAppOpen] = useState<boolean>(false);
  const isInstalling = state.installing || installingProp;
  const installingText =
    state.currentQuest?.description ??
    (installingProgress != null ? `Installing ${installingProgress}%` : 'Installing');
  return (
    <React.Fragment>
      <button
        className={`px-4 py-3 bg-success text-white rounded-xl font-semibold text-base hover:bg-success/80 transition inline-flex items-center gap-2 ${fullWidth ? 'w-full justify-center' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setInstallAppOpen(true)}
        data-testid="install-app-button"
        disabled={disabled || isInstalling}
      >
        {isInstalling ? (
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <Download size={18} />
        )}
        {isInstalling ? (
          <MarqueeText text={installingText} />
        ) : (
          `Install Now${showSelectedVersion ? ` ${typeof version === 'string' ? version : version?.version}` : ''}`
        )}
      </button>
      <ContentDialog
        open={installAppOpen}
        setOpen={setInstallAppOpen}
        title={'Install ' + app.title}
      >
        <InstallationStepper
          app={app}
          version={typeof version === 'string' ? version : version?.version}
          onStateChange={(s: InstallerState) =>
            setState({ installing: s.installing, currentQuest: s.currentQuest ?? null })
          }
        />
      </ContentDialog>
    </React.Fragment>
  );
}
