/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Jun 07 2022
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
import React from 'react'
import PropTypes from 'prop-types'
import { Box } from '@mui/system'
import { Button, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

function VersionSelector (props) {
  const { availableVersions, setSelectedVersion, selectedVersion } = props
  const handleChange = (event) => {
    setSelectedVersion(availableVersions?.find(version => version.version === event.target.value))
  }

  const onReleaseNoteButtonClick = (event) => {
    window.open(selectedVersion?.release_notes)
  }
  const onBreakingChangesButtonClick = (event) => {
    window.open(selectedVersion?.breaking_changes)
  }
  return (
    <Box sx={{ mt: 1, mb: 1 }}>
        {(availableVersions?.length === 1 && availableVersions[0].version) &&
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Version {availableVersions[0]?.version}
        </Typography>}
        {availableVersions?.length > 1 &&
        <FormControl fullWidth size="small">
            <InputLabel id="version-label">Version</InputLabel>
            <Select
            labelId="version-select-label"
            id="version-select"
            value={selectedVersion.version}
            label="Version"
            onChange={handleChange}
            >
                {availableVersions?.map((version) => (
                <MenuItem key={version.version} value={version.version}>{version.version} {version.installed ? '(installed)' : ''}</MenuItem>
                ))}
            </Select>
        </FormControl>
        }
        {selectedVersion?.release_notes &&
        <Button size="small" onClick={onReleaseNoteButtonClick} endIcon={<OpenInNewIcon/>}>What&apos;s new?</Button>}
        {selectedVersion?.breaking_changes &&
        <Button size="small" onClick={onBreakingChangesButtonClick} endIcon={<OpenInNewIcon/>}>Breaking changes</Button>}
    </Box>
  )
}

function createVersion (version, release_notes, breaking_changes, installed) {
  return { version, release_notes, breaking_changes, installed }
}

function createVersions (versions, installedVersion) {
  const versionsArray = []

  if (versions) {
    versions.forEach(version => {
      versionsArray.push(createVersion(version, undefined, undefined, version === installedVersion))
    })
  } else {
    versionsArray.push(createVersion(installedVersion, null, null, null))
  }
  return versionsArray
}

function getLatestVersion (versions) {
  if (versions) {
    return versions[0]
  }
}

export { VersionSelector, createVersion, createVersions, getLatestVersion }

VersionSelector.propTypes = {
  availableVersions: PropTypes.array,
  setSelectedVersion: PropTypes.func,
  selectedVersion: PropTypes.object
}
