import React, { useState } from 'react';
type App = any;
type Version = string;
import ContentDialog from '@app/components/ContentDialog';
import InstallationStepper from '@features/apps/components/installation/InstallationStepper';
import { Download } from 'lucide-react';
import { Quest } from '@generated/core/schemas';
import MarqueeText from '@app/components/MarqueeText';

interface InstallButtonProps {
  app: App;
  version: Version;
  onInstallComplete?: (success: boolean, message: string, error?: string) => void;
  showSelectedVersion?: boolean;
  disabled?: boolean;
  size?: string;
  fullWidth?: boolean;
  color?: string;
  sx?: any;
  [key: string]: any;
}

export default function InstallButton({
  app,
  version,
  onInstallComplete,
  showSelectedVersion = false,
  disabled,
  fullWidth,
  ...rest
}: InstallButtonProps): React.ReactElement {
  const [state, setState] = useState<{ installing: boolean; currentQuest: Quest | null }>({
    installing: false,
    currentQuest: null,
  });
  const [installAppOpen, setInstallAppOpen] = useState<boolean>(false);
  return (
    <React.Fragment>
      <button
        className={`px-4 py-2 bg-success text-white rounded-lg font-semibold hover:bg-success/80 transition inline-flex items-center gap-2 ${fullWidth ? 'w-full justify-center' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setInstallAppOpen(true)}
        data-testid="install-app-button"
        disabled={disabled || state.installing}
      >
        {state.installing ? (
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <Download size={18} />
        )}
        {state.installing ? (
          <MarqueeText text={state.currentQuest?.description || 'Installing'} />
        ) : (
          `Install Now${showSelectedVersion ? ` ${version.version}` : ''}`
        )}
      </button>
      <ContentDialog
        open={installAppOpen}
        setOpen={setInstallAppOpen}
        title={'Install ' + app.title}
      >
        <InstallationStepper
          app={app}
          version={version.version}
          onStateChange={(state: any) =>
            setState({ installing: state.installing, currentQuest: state.currentQuest })
          }
        />
      </ContentDialog>
    </React.Fragment>
  );
}
