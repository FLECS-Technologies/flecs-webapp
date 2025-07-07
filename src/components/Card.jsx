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

import { React, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { IconButton, Tooltip } from '@mui/material';
import LoadButton from './LoadButton';
import ConfirmDialog from './ConfirmDialog';
import AppAPI from '../api/device/AppAPI';
import RequestAppDialog from './RequestAppDialog';
import { ReferenceDataContext } from '../data/ReferenceDataContext';
import ActionSnackbar from './ActionSnackbar';
import ContentDialog from './ContentDialog';
// import InstallAppStepper from './InstallAppStepper'
import { createVersion, createVersions, getLatestVersion } from '../utils/version-utils';
import { VersionSelector } from './autocomplete/VersionSelector';
import AppRating from './AppRating';
import { useSystemContext } from '../data/SystemProvider';
import { isBlacklisted } from '../api/marketplace/ProductService';
import { JobsContext } from '../data/JobsContext';
import InstallationStepper from './apps/installation/InstallationStepper';
import { ShoppingCart } from '@mui/icons-material';
import HelpButton from './buttons/help/HelpButton';

export default function OutlinedCard(props) {
  const { appList, setUpdateAppList } = useContext(ReferenceDataContext);
  const { systemInfo } = useSystemContext();
  const [blackListed] = useState(isBlacklisted(systemInfo, props.blacklist));
  const installed = props.status === 'installed';
  const [selectedVersion, setSelectedVersion] = useState(
    createVersion(
      props.installedVersions?.length > 0
        ? getLatestVersion(props.installedVersions)
        : getLatestVersion(props.versions),
      null,
      null,
      props.version,
    ),
  );
  const [uninstalling, setUninstalling] = useState(false);
  const [available] = useState(
    props.availability === 'available' || props.availability === 'instock',
  );
  const installable = props.requirement && props.requirement?.includes(systemInfo?.arch);
  const displayStateRequest = available ? 'none' : 'block';
  const displayState = available ? 'block' : 'none';
  const [open, setConfirmOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarState, setSnackbarState] = useState({
    snackbarText: 'Info',
    alertSeverity: 'success',
    clipBoardContent: '',
  });
  const { alertSeverity, snackbarText, clipBoardContent } = snackbarState;
  const [installAppOpen, setInstallAppOpen] = useState(false);
  const [updateAppOpen, setUpdateAppOpen] = useState(false);
  const { setFetchingJobs } = useContext(JobsContext);

  function loadReferenceData(props) {
    if (appList) {
      const tmpApp = appList.find((obj) => {
        return obj.appKey.name === props.appKey.name && obj.appKey.version === props.appKey.version;
      });

      return tmpApp;
    }
  }

  const uninstallApp = async (props) => {
    setUninstalling(true);
    setFetchingJobs(true);
    const appAPI = new AppAPI(props);
    appAPI.setAppData(loadReferenceData(props));
    appAPI.setVersion(selectedVersion.version);
    await appAPI.uninstall();

    const alertSeverity = appAPI.lastAPICallSuccessful ? 'success' : 'error';
    const displayCopyIcon = appAPI.lastAPICallSuccessful ? 'none' : 'block';
    let snackbarText;
    let clipBoardContent;

    if (appAPI.lastAPICallSuccessful) {
      // trigger a reload of all installed apps
      setUpdateAppList(true);

      snackbarText = props.title + ' successfully uninstalled.';
    } else {
      snackbarText = 'Failed to uninstall ' + props.title + '.';
      clipBoardContent = appAPI.lastAPIError;
    }

    setSnackbarState({
      alertSeverity,
      snackbarText,
      displayCopyState: displayCopyIcon,
      clipBoardContent,
    });
    setSnackbarOpen(true);
    setUninstalling(false);
    setFetchingJobs(false);
  };

  function requestApp(props, success) {
    const alertSeverity = success ? 'success' : 'error';
    const displayCopyIcon = success ? 'none' : 'block';
    let snackbarText = '';
    if (success) {
      snackbarText =
        'Successfully requested ' + props.title + ' as a new app from ' + props.author + '.';
    } else {
      snackbarText = 'Failed to send us the request. Please try again later.';
    }

    setSnackbarState({
      alertSeverity,
      snackbarText,
      displayCopyState: displayCopyIcon,
    });
    setSnackbarOpen(true);
  }

  return (
    <Card
      data-testid="app-card"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'column',
        minWidth: 300,
        maxWidth: 300,
        minHeight: 260,
        mr: 2,
        mb: 2,
      }}
    >
      <CardHeader
        avatar={<Avatar src={props.avatar} />}
        title={props.title}
        subheader={
          <div>
            <div>{props.author}</div>
            <AppRating app={props} />
          </div>
        }
      ></CardHeader>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.primary" gutterBottom>
          {props.description}
        </Typography>
        <VersionSelector
          availableVersions={createVersions(props.versions, props.installedVersions)}
          selectedVersion={selectedVersion}
          setSelectedVersion={setSelectedVersion}
        ></VersionSelector>
      </CardContent>
      <CardActions>
        <Button
          data-testid="app-request-button"
          variant="outlined"
          aria-label="app-request-button"
          color="info"
          disabled={available}
          onClick={() => setRequestOpen(true)}
          style={{ display: displayStateRequest }}
        >
          Request
        </Button>
        <Tooltip
          title={installable ? '' : `This app can only be installed on ${props.requirement}`}
        >
          <div>
            {!installed && (
              <LoadButton
                text="Install"
                variant="contained"
                color="success"
                label="install-app-button"
                disabled={installed || blackListed || !installable}
                onClick={() => setInstallAppOpen(true)}
                displaystate={displayState}
              />
            )}
          </div>
        </Tooltip>
        {!props.installedVersions?.includes(selectedVersion.version) && installed && (
          <LoadButton
            text="Update"
            variant="contained"
            color="primary"
            label="update-app-button"
            disabled={blackListed}
            onClick={() => setUpdateAppOpen(true)}
            displaystate={displayState}
          />
        )}
        {props.installedVersions?.includes(selectedVersion.version) && (
          <LoadButton
            text="Uninstall"
            variant="outlined"
            label="uninstall-app-button"
            disabled={uninstalling}
            color="error"
            onClick={() => setConfirmOpen(true)}
            displaystate={displayState}
            loading={uninstalling || false}
          />
        )}
        {props.purchasable && Number(props.price) > 0 && (
          <Tooltip title={`Buy license for ${props.title}`}>
            <IconButton href={props.permalink} target="_blank" rel="noreferrer">
              <ShoppingCart></ShoppingCart>
            </IconButton>
          </Tooltip>
        )}
        {props.documentationUrl && (
          <HelpButton url={props.documentationUrl} label="Documentation" />
        )}
        <ConfirmDialog
          data-testid="confirm-dialog"
          title={'Uninstall ' + props.title + '?'}
          open={open}
          setOpen={setConfirmOpen}
          onConfirm={() => uninstallApp(props)}
        >
          Are you sure you want to uninstall {props.title}?
        </ConfirmDialog>
        <RequestAppDialog
          appName={props.title}
          appauthor={props.author}
          open={requestOpen}
          setOpen={setRequestOpen}
          onConfirm={(success) => requestApp(props, success)}
        ></RequestAppDialog>
        <ActionSnackbar
          text={snackbarText}
          errorText={clipBoardContent}
          open={snackbarOpen}
          setOpen={setSnackbarOpen}
          alertSeverity={alertSeverity}
        />
        <ContentDialog
          open={installAppOpen}
          setOpen={setInstallAppOpen}
          title={'Install ' + props.title}
        >
          <InstallationStepper app={props} version={selectedVersion.version} />
        </ContentDialog>
        <ContentDialog
          open={updateAppOpen}
          setOpen={setUpdateAppOpen}
          title={'Update ' + props.title + ' to ' + selectedVersion.version}
        >
          <InstallationStepper app={props} version={selectedVersion.version} update={true} />
        </ContentDialog>
      </CardActions>
    </Card>
  );
}

OutlinedCard.propTypes = {
  app: PropTypes.string,
  appKey: PropTypes.object,
  avatar: PropTypes.string,
  title: PropTypes.string,
  author: PropTypes.string,
  version: PropTypes.string,
  versions: PropTypes.array,
  description: PropTypes.string,
  status: PropTypes.string,
  availability: PropTypes.string,
  instances: PropTypes.array,
  relatedLinks: PropTypes.array,
  requirement: PropTypes.array,
  id: PropTypes.number,
  average_rating: PropTypes.string,
  rating_count: PropTypes.number,
  blacklist: PropTypes.array,
  installedVersions: PropTypes.array,
  price: PropTypes.string,
  purchasable: PropTypes.bool,
  permalink: PropTypes.string,
  documentationUrl: PropTypes.string,
};
