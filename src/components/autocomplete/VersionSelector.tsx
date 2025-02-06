/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Jan 29 2025
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
import { Box } from '@mui/system'
import {
  Autocomplete,
  Badge,
  Button,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  TextField,
  Typography
} from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import {
  findVersionByProperty,
  getLatestVersion
} from '../../utils/version-utils'
import { Version } from '../../models/version'

interface VersionSelectorProps {
  availableVersions: Version[]
  setSelectedVersion: (version: Version) => void
  selectedVersion: Version | undefined
}

export const VersionSelector: React.FC<VersionSelectorProps> = ({
  availableVersions,
  setSelectedVersion,
  selectedVersion
}) => {
  const newVersionAvailable =
    !getLatestVersion(availableVersions)?.installed &&
    availableVersions?.filter((version) => version?.installed).length > 0

  const handleVersionChange = (
    event: React.ChangeEvent<{}>,
    newValue: Version | undefined
  ) => {
    if (newValue && availableVersions) {
      setSelectedVersion(
        findVersionByProperty(availableVersions, newValue.version)
      )
    }
  }

  const onReleaseNoteButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (selectedVersion?.release_notes) {
      window.open(selectedVersion.release_notes)
    }
  }

  const onBreakingChangesButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (selectedVersion?.breaking_changes) {
      window.open(selectedVersion.breaking_changes)
    }
  }

  return (
    <Box sx={{ mt: 1, mb: 1 }}>
      {availableVersions?.length === 1 && availableVersions[0]?.version && (
        <Typography sx={{ fontSize: 14 }} color='text.secondary' gutterBottom>
          Version {availableVersions[0].version}
        </Typography>
      )}
      {availableVersions?.length > 1 && (
        <Badge
          sx={{ width: '100%' }}
          invisible={!newVersionAvailable}
          badgeContent={
            <NewReleasesIcon color='primary' fontSize='small'></NewReleasesIcon>
          }
        >
          <Autocomplete
            fullWidth
            disableClearable
            value={selectedVersion}
            onChange={handleVersionChange}
            options={availableVersions}
            getOptionLabel={(option) => option.version}
            isOptionEqualToValue={(option, value) =>
              option.version === value.version
            }
            renderOption={(props, option) => (
              <MenuItem {...props} key={option.version}>
                <ListItemText primary={option.version} />
                {option.installed && (
                  <ListItemSecondaryAction>
                    <Typography variant='caption' color='textSecondary'>
                      installed
                    </Typography>
                  </ListItemSecondaryAction>
                )}
              </MenuItem>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label='Version'
                variant='outlined'
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {params.InputProps.endAdornment}
                      {params.inputProps.value &&
                        availableVersions.find(
                          (version) =>
                            version.version === params.inputProps.value &&
                            version.installed
                        ) && (
                          <Typography
                            variant='caption'
                            color='textSecondary'
                            sx={{ ml: 1 }}
                          >
                            installed
                          </Typography>
                        )}
                    </>
                  )
                }}
              />
            )}
          />
        </Badge>
      )}
      {selectedVersion?.release_notes && (
        <Button
          size='small'
          onClick={onReleaseNoteButtonClick}
          startIcon={<OpenInNewIcon />}
        >
          Release Notes
        </Button>
      )}
      {selectedVersion?.breaking_changes && (
        <Button
          size='small'
          onClick={onBreakingChangesButtonClick}
          startIcon={<OpenInNewIcon />}
        >
          Breaking Changes
        </Button>
      )}
    </Box>
  )
}

export default VersionSelector
