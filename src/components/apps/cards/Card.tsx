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
import { Box, CardActionArea, Chip, Toolbar } from '@mui/material';
import { createVersion, createVersions, getLatestVersion } from '../../../utils/version-utils';
import { useSystemContext } from '@contexts/data/SystemProvider';
import { Version } from '../../../models/version';
import { App } from '../../../models/app';
import { SystemContextType } from '../../../models/system';
import { EditorButtons } from '../../buttons/editors/EditorButtons';
import FullCard from './FullCard';
import { CheckCircle, ErrorOutline, Update } from '@mui/icons-material';
import { decodeHtmlEntities } from '../../../utils/html-utils';
import InstallButton from '../../../components/buttons/app/InstallButton';
import UpdateButton from '../../../components/buttons/app/UpdateButton';

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
          <Box
            sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center', mt: 0.5 }}
          >
            {props.categories
              ?.filter((cat) => cat.name.toLowerCase() !== 'app')
              .map((cat, index) => (
                <Chip
                  key={index}
                  label={decodeHtmlEntities(cat.name)}
                  size="small"
                  variant="outlined"
                />
              ))}
          </Box>
        </Box>
        {/* card content */}
        <Typography align="center" variant="body2" color="info" sx={{ mt: 1 }}>
          MORE DETAILS
        </Typography>
      </CardActionArea>
      {/* card actions */}
      <CardActions>
        {!installed && (
          <InstallButton app={props} version={latestVersion} disabled={installed || !installable}>
            Install
          </InstallButton>
        )}
        {installed && props.instances && (
          <EditorButtons instance={props.instances[0]}></EditorButtons>
        )}
        {updateAvailable && <UpdateButton app={props} to={latestVersion}></UpdateButton>}
      </CardActions>

      <FullCard app={props} open={fullCardOpen} onClose={() => setFullCardOpen(false)} />
    </Card>
  );
}
