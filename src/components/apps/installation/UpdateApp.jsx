import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { Button, Grid, Typography, CircularProgress, Alert, AlertTitle } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Replay as ReplayIcon,
  Report as ReportIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { ReferenceDataContext } from '../../../data/ReferenceDataContext';
import { InstallAppAPI } from '../../../api/device/apps/install';
import { checkAllJobStatuses, checkJobStatus } from '../../../utils/checkJobStatus';
import { UpdateInstances } from '../../../api/device/instances/instance';
import Job from '../../job/Job';

export default function UpdateApp({ app, from, to, handleActiveStep }) {
  const executedRef = useRef(false);
  const { appList, setUpdateAppList } = useContext(ReferenceDataContext);

  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(false);
  const [installationMessage, setInstallationMessage] = useState('');
  const [jobId, setJobId] = useState();
  const [status, setStatus] = useState();

  const updateApp = useCallback(
    async (app, from, to) => {
      try {
        const installedApp = appList?.find(
          (obj) => obj.appKey.name === app.appKey.name && obj.appKey.version === from,
        );

        if (!installedApp)
          throw new Error(`${app.appKey.name} is not installed and therefore can't be updated!`);

        setUpdating(true);

        // 1. install the requested version
        setInstallationMessage(from < to ? 'Updating...' : 'Downgrading...');
        const installJobId = await InstallAppAPI(app.appKey.name, to);
        setJobId(installJobId);

        // 2. wait until installation is finished
        const installStatus = await checkJobStatus(installJobId);
        if (installStatus !== 'successful') throw new Error('Installation failed');

        // 3. update all instances
        setInstallationMessage(`Migrating ${installedApp?.instances?.length} instances...`);
        const updateJobIds = await UpdateInstances(installedApp?.instances, to);
        // 4. wait until all instances are updated
        const updateStatuses = await checkAllJobStatuses(updateJobIds);
        const unsuccessfulJob = updateStatuses.find((status) => status !== 'successful');
        if (unsuccessfulJob) {
          throw new Error(`One or more instance migrations failed with status: ${unsuccessfulJob}`);
        }

        setInstallationMessage(
          `Congratulations! ${app?.title} was successfully ${
            from < to ? 'updated' : 'downgraded'
          } from version ${from} to version ${to}!`,
        );
        setUpdateAppList(true);
        setUpdating(false);
        setSuccess(true);
        setError(false);
        handleActiveStep();
      } catch (error) {
        setInstallationMessage(
          `Oops... ${
            error.message ||
            `Error during the ${from < to ? 'update' : 'downgrade'} of ${app?.title}.`
          }`,
        );

        setError(true);
        setSuccess(false);
        setUpdating(false);
        handleActiveStep(-1);
      }
    },
    [appList, setUpdateAppList, checkJobStatus],
  );

  useEffect(() => {
    if (executedRef.current) return;

    if (app && from && to && !updating && (!success || !error)) {
      setRetry(false);
      updateApp(app, from, to);
    }

    executedRef.current = true;
  }, [retry, app, from, to, updating, success, error, updateApp]);

  const handleRetryClick = () => {
    setRetry(true);
    executedRef.current = false;
  };

  return (
    <div>
      <Grid
        data-testid="update-app-step"
        container
        direction="column"
        spacing={1}
        style={{ minHeight: 350, marginTop: 16 }}
        justifyContent="center"
        alignItems="center"
      >
        <Grid>
          {updating && <CircularProgress />}
          {success && !updating && (
            <CheckCircleIcon data-testid="success-icon" fontSize="large" color="success" />
          )}
          {error && <ReportIcon data-testid="error-icon" fontSize="large" color="error" />}
        </Grid>
        <Grid>
          <Typography data-testid="installationMessage">{installationMessage}</Typography>
        </Grid>
        <Grid>
          <Job jobId={jobId} setStatus={setStatus}></Job>
        </Grid>
        {error && (
          <Grid>
            <Button onClick={handleRetryClick} startIcon={<ReplayIcon />}>
              Retry
            </Button>
          </Grid>
        )}
      </Grid>
    </div>
  );
}

UpdateApp.propTypes = {
  app: PropTypes.object,
  from: PropTypes.string,
  to: PropTypes.string,
  handleActiveStep: PropTypes.func,
};
