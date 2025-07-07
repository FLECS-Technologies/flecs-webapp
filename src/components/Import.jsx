/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Dec 09 2022
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
import React from 'react';
import PropTypes from 'prop-types';
import DownloadIcon from '@mui/icons-material/Download';
import { postImportApps } from '../api/device/ImportAppsService';
import ActionSnackbar from './ActionSnackbar';
import FileOpen from './FileOpen';
import { ReferenceDataContext } from '../data/ReferenceDataContext';
import { JobsContext } from '../data/JobsContext';
import { OnboardingDeviceAPI } from '../api/device/onboarding/onboarding';

export default function Import(props) {
  const { setUpdateAppList } = React.useContext(ReferenceDataContext);
  const { ...buttonProps } = props;
  const [importing, setImporting] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarState, setSnackbarState] = React.useState({
    snackbarText: 'Info',
    alertSeverity: 'success',
  });
  const { jobs, fetchJobs, fetchJobById } = React.useContext(JobsContext);
  const [jobId, setJobId] = React.useState(null);

  React.useEffect(() => {
    let interval;
    if (jobId) {
      const job = jobs.find((job) => job.id === jobId);
      if (job && (job.status === 'running' || job.status === 'queued')) {
        // Start polling
        interval = setInterval(async () => {
          await fetchJobById(jobId);
        }, 2000); // Poll every 2 seconds
      } else if (job && job.status === 'successful') {
        setUpdateAppList(true);
        clearInterval(interval); // Clear interval when job is finished
        setSnackbarState({
          alertSeverity: 'success',
          snackbarText: 'Importing finished successfully',
        });
        setSnackbarOpen(true);
        setImporting(false);
        setJobId(null);
      } else if (job && job.status === 'failed') {
        setSnackbarState({
          alertSeverity: 'error',
          snackbarText: 'Importing failed',
        });
        setSnackbarOpen(true);
        setImporting(false);
        setJobId(null);
        clearInterval(interval); // Clear interval when job is finished
      } else {
        clearInterval(interval); // Clear interval when job is finished
      }
    }
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [jobId, jobs]);

  const handleFileUpload = (file) => {
    if (file) {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.tar.gz') || fileName.endsWith('.tar')) {
        handleTarFile(file);
      } else if (fileName.endsWith('.json')) {
        handleJsonFile(file);
      } else {
        setSnackbarState({
          alertSeverity: 'error',
          snackbarText: 'Unsupported file type. Please upload a .tar, .tar.gz or .json file.',
        });
        setSnackbarOpen(true);
      }
    }
  };

  const handleJsonFile = async (file) => {
    setImporting(true);
    OnboardingDeviceAPI(file)
      .then(async (response) => {
        if (response.jobId) {
          await fetchJobs();
          setJobId(response.jobId);
        }
      })
      .catch((error) => {
        setImporting(false);
        setSnackbarState({
          alertSeverity: 'error',
          snackbarText: error?.response?.data?.message
            ? error?.response?.data?.message
            : error?.message,
        });
        setSnackbarOpen(true);
      });
  };

  const handleTarFile = async (props) => {
    setImporting(true);

    const file = props;
    const fileName = props.name;

    postImportApps(file, fileName)
      .then(async (response) => {
        const jobId = JSON.parse(response).jobId;
        if (jobId) {
          await fetchJobs();
          setJobId(jobId);
        }
      })
      .catch((error) => {
        setImporting(false);
        setSnackbarState({
          alertSeverity: 'error',
          snackbarText: error?.response?.data?.message
            ? error?.response?.data?.message
            : error?.message,
        });
        setSnackbarOpen(true);
      });
  };

  return (
    <>
      <FileOpen
        {...buttonProps}
        data-testid="import-apps-button"
        buttonText="Import"
        buttonIcon={<DownloadIcon />}
        accept=".tar.gz, .tar, .json"
        onConfirm={handleFileUpload}
        loading={importing}
        wholeFile={true}
        disabled={buttonProps.disabled || importing}
      ></FileOpen>
      <ActionSnackbar
        text={snackbarState.snackbarText}
        open={snackbarOpen}
        setOpen={setSnackbarOpen}
        alertSeverity={snackbarState.alertSeverity}
      />
    </>
  );
}

Import.propTypes = {
  apps: PropTypes.array,
  name: PropTypes.string,
};
