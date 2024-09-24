/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Jun 27 2024
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
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
import LaunchIcon from '@mui/icons-material/Launch'
import { LoadingButton } from '@mui/lab'
import { AppInstance } from '../../../api/device/instances/instance'
import LoadIconButton from '../../LoadIconButton'
import { Button, ButtonGroup, Tooltip } from '@mui/material'
import { ContentCopy } from '@mui/icons-material'

interface OpenAppProps {
  instance: AppInstance
  variant: string
}

export const OpenAppButton: React.FC<OpenAppProps> = ({
  instance,
  variant
}: OpenAppProps) => {
  function openApp() {
    window.open(createUrl())
  }

  function copyAppUrl() {
    navigator.clipboard.writeText(createUrl())
  }

  function createUrl() {
    let editorURL: string = 'http://'

    if (process.env.REACT_APP_ENVIRONMENT === 'development') {
      editorURL = process.env.REACT_APP_DEV_CORE_URL || ''
    } else {
      editorURL = editorURL.concat(window.location.host)
    }

    editorURL = editorURL.concat('/api' + instance.editors[0].url)
    return editorURL
  }

  return (
    <React.Fragment>
      {instance.editors.length > 0 && (
        <React.Fragment>
          {(variant === undefined || variant === 'contained') && (
            <ButtonGroup disableElevation variant='contained'>
              <Tooltip title='Click to open the app in a new tab'>
                <Button
                  aria-label='open-app-button'
                  onClick={() => openApp()}
                  startIcon={<LaunchIcon />}
                >
                  open app
                </Button>
              </Tooltip>
              <Tooltip title='Click to copy app URL to clipboard'>
                <Button
                  aria-label='copy-url-button'
                  onClick={() => copyAppUrl()}
                >
                  <ContentCopy fontSize='small' />
                </Button>
              </Tooltip>
            </ButtonGroup>
          )}
          {variant === 'icon' && (
            <LoadIconButton
              label='open-app-icon-button'
              color='primary'
              onClick={() => openApp()}
              icon={<LaunchIcon />}
            />
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  )
}
