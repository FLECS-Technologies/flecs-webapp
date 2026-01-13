/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Fri Jan 09 2026
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState } from 'react';
import { App } from '../../../models/app';
import { Version } from '../../../models/version';
import ContentDialog from '../../../components/ContentDialog';
import InstallationStepper from '../../../components/apps/installation/InstallationStepper';
import { Button, ButtonProps } from '@mui/material';
import { Download } from '@mui/icons-material';
import { Quest } from '@flecs/core-client-ts';
import MarqueeText from '../../text/MarqueeText';

interface InstallButtonProps extends Omit<ButtonProps, 'onClick'> {
  app: App;
  version: Version;
  onInstallComplete?: (success: boolean, message: string, error?: string) => void;
  showSelectedVersion?: boolean;
}

export default function InstallButton({
  app,
  version,
  onInstallComplete,
  showSelectedVersion = false,
  ...buttonProps
}: InstallButtonProps): React.ReactElement {
  const [state, setState] = useState<{ installing: boolean; currentQuest: Quest | null }>({
    installing: false,
    currentQuest: null,
  });
  const [installAppOpen, setInstallAppOpen] = useState<boolean>(false);
  return (
    <React.Fragment>
      <Button
        startIcon={<Download />}
        variant="contained"
        color="success"
        fullWidth
        onClick={() => setInstallAppOpen(true)}
        data-testid="install-app-button"
        loading={state.installing}
        loadingPosition="start"
        {...buttonProps}
      >
        {state.installing ? (
          <MarqueeText text={state.currentQuest?.description || 'Installing'} />
        ) : (
          `Install${showSelectedVersion ? ` ${version.version}` : ''}`
        )}
      </Button>
      <ContentDialog
        open={installAppOpen}
        setOpen={setInstallAppOpen}
        title={'Install ' + app.title}
      >
        <InstallationStepper
          app={app}
          version={version.version}
          onStateChange={(state) =>
            setState({ installing: state.installing, currentQuest: state.currentQuest })
          }
        />
      </ContentDialog>
    </React.Fragment>
  );
}
