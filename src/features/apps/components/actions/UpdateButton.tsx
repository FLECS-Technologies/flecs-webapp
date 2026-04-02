import React, { useState } from 'react';
type App = any;
type Version = string;
import ContentDialog from '@app/components/ContentDialog';
import InstallationStepper from '@features/apps/components/installation/InstallationStepper';
import { RefreshCw } from 'lucide-react';
import { Quest } from '@generated/core/schemas';
import MarqueeText from '@app/components/MarqueeText';

interface UpdateButtonProps {
  app: App;
  from?: Version;
  to: Version;
  onInstallComplete?: (success: boolean, message: string, error?: string) => void;
  showSelectedVersion?: boolean;
  fullWidth?: boolean;
  sx?: any;
  [key: string]: any;
}

export default function UpdateButton({
  app,
  from,
  to,
  onInstallComplete,
  showSelectedVersion = false,
  fullWidth,
  ...rest
}: UpdateButtonProps): React.ReactElement {
  const [state, setState] = useState<{ updating: boolean; currentQuest: Quest | null }>({
    updating: false,
    currentQuest: null,
  });
  const [updateAppOpen, setUpdateAppOpen] = useState<boolean>(false);
  return (
    <React.Fragment>
      <button
        className={`px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent/80 transition inline-flex items-center gap-2 ${fullWidth ? 'w-full justify-center' : ''}`}
        onClick={() => setUpdateAppOpen(true)}
        data-testid="update-app-button"
        disabled={state.updating}
      >
        {state.updating ? (
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <RefreshCw size={18} />
        )}
        {state.updating ? (
          <MarqueeText text={state.currentQuest?.description || 'Updating'} />
        ) : (
          `Update${showSelectedVersion ? ` to ${to.version}` : ''}`
        )}
      </button>
      <ContentDialog
        open={updateAppOpen}
        setOpen={setUpdateAppOpen}
        title={`Update ${app.title} to ${to.version}`}
      >
        <InstallationStepper
          app={app}
          version={to.version}
          update={true}
          onStateChange={(state: any) =>
            setState({ updating: state.updating, currentQuest: state.currentQuest })
          }
        />
      </ContentDialog>
    </React.Fragment>
  );
}
