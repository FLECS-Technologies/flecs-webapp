/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Nov 30 2021
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

import { useState } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { Box, Button, CardActionArea, Chip, Toolbar } from '@mui/material';
import ContentDialog from '../../ContentDialog';
import { createVersion, createVersions, getLatestVersion } from '../../../utils/version-utils';
import { useSystemContext } from '../../../data/SystemProvider';
import InstallationStepper from '../installation/InstallationStepper';
import { Version } from '../../../models/version';
import { App } from '../../../models/app';
import { SystemContextType } from '../../../models/system';
import { EditorButtons } from '../../buttons/editors/EditorButtons';
import FullCard from './FullCard';
import { CheckCircle, Download, ErrorOutline, Update } from '@mui/icons-material';

export default function OutlinedCard(props: App) {
  const { systemInfo } = useSystemContext() as SystemContextType;
  const installed = props.status === 'installed';
  const versionsArray = props.versions
    ? createVersions(props.versions, props.installedVersions || [])
    : [];
  const [latestVersion] = useState<Version>(getLatestVersion(versionsArray) ?? createVersion(''));
  const installable =
    props.requirement && systemInfo?.arch && props.requirement.includes(systemInfo.arch);
  const updateAvailable = !props.installedVersions?.includes(latestVersion.version) && installed;
  const [installAppOpen, setInstallAppOpen] = useState<boolean>(false);
  const [updateAppOpen, setUpdateAppOpen] = useState<boolean>(false);
  const [fullCardOpen, setFullCardOpen] = useState<boolean>(false);

  const handleCardClick = () => {
    setFullCardOpen(true);
  };

  return (
    <Card
      data-testid="app-card"
      variant="outlined"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'column',
        minWidth: 300,
        maxWidth: 300,
        mr: 2,
        mb: 2,
      }}
    >
      <CardActionArea onClick={() => handleCardClick()}>
        {/* card header */}
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            mb: 1,
          }}
        >
          <Toolbar
            variant="dense"
            sx={{ justifyContent: 'flex-end', width: '100%', alignSelf: 'stretch' }}
          >
            {installed && !updateAvailable && (
              <Chip icon={<CheckCircle />} label="Installed" color="success" size="small" />
            )}
            {updateAvailable && <Chip icon={<Update />} label="Update" color="info" size="small" />}
            {!installable && (
              <Chip icon={<ErrorOutline />} label="Not Installable" color="error" size="small" />
            )}
          </Toolbar>
          <Avatar src={props.avatar} variant="rounded" sx={{ mb: 1, width: 54, height: 54 }} />
          <Typography variant="h6" align="center">
            {props.title}
          </Typography>
          <Typography variant="subtitle2" align="center">
            by {props.author}
          </Typography>
        </Box>
        {/* card content */}
        <Typography align="center" variant="body2" color="info" sx={{ mt: 1 }}>
          MORE DETAILS
        </Typography>
      </CardActionArea>
      {/* card actions */}
      <CardActions>
        {!installed && (
          <Button
            startIcon={<Download />}
            variant="contained"
            color="success"
            fullWidth
            disabled={installed || !installable}
            onClick={() => setInstallAppOpen(true)}
            data-testid="install-app-button"
          >
            Install
          </Button>
        )}
        {installed && props.instances && (
          <EditorButtons instance={props.instances[0]}></EditorButtons>
        )}
        {updateAvailable && (
          <Button
            startIcon={<Update />}
            fullWidth
            variant="contained"
            color="info"
            onClick={() => setUpdateAppOpen(true)}
          >
            Update
          </Button>
        )}

        <ContentDialog
          open={installAppOpen}
          setOpen={setInstallAppOpen}
          title={'Install ' + props.title}
        >
          <InstallationStepper app={props} version={latestVersion.version} />
        </ContentDialog>
        <ContentDialog
          open={updateAppOpen}
          setOpen={setUpdateAppOpen}
          title={'Update ' + props.title + ' to ' + latestVersion.version}
        >
          <InstallationStepper app={props} version={latestVersion.version} update={true} />
        </ContentDialog>
      </CardActions>

      <FullCard app={props} open={fullCardOpen} onClose={() => setFullCardOpen(false)} />
    </Card>
  );
}
