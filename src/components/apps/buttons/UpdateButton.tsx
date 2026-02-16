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
import ContentDialog from '../../ui/ContentDialog';
import InstallationStepper from '../installation/InstallationStepper';
import { Button, ButtonProps } from '@mui/material';
import { Update } from '@mui/icons-material';
import { Quest } from '@flecs/core-client-ts';
import MarqueeText from '../../ui/MarqueeText';

interface UpdateButtonProps extends Omit<ButtonProps, 'onClick'> {
  app: App;
  from?: Version;
  to: Version;
  onInstallComplete?: (success: boolean, message: string, error?: string) => void;
  showSelectedVersion?: boolean;
}

export default function UpdateButton({
  app,
  from,
  to,
  onInstallComplete,
  showSelectedVersion = false,
  ...buttonProps
}: UpdateButtonProps): React.ReactElement {
  const [state, setState] = useState<{ updating: boolean; currentQuest: Quest | null }>({
    updating: false,
    currentQuest: null,
  });
  const [updateAppOpen, setUpdateAppOpen] = useState<boolean>(false);
  return (
    <React.Fragment>
      <Button
        startIcon={<Update />}
        variant="contained"
        color="info"
        fullWidth
        onClick={() => setUpdateAppOpen(true)}
        data-testid="update-app-button"
        loading={state.updating}
        loadingPosition="start"
        {...buttonProps}
      >
        {state.updating ? (
          <MarqueeText text={state.currentQuest?.description || 'Updating'} />
        ) : (
          `Update${showSelectedVersion ? ` to ${to.version}` : ''}`
        )}
      </Button>

      <ContentDialog
        open={updateAppOpen}
        setOpen={setUpdateAppOpen}
        title={`Update ${app.title} to ${to.version}`}
      >
        <InstallationStepper
          app={app}
          version={to.version}
          update={true}
          onStateChange={(state) =>
            setState({ updating: state.updating, currentQuest: state.currentQuest })
          }
        />
      </ContentDialog>
    </React.Fragment>
  );
}
