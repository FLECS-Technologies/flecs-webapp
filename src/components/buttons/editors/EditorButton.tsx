/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed May 15 2025
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
import LaunchIcon from '@mui/icons-material/Launch'
import { Button, ButtonGroup, Tooltip } from '@mui/material'

interface EditorButtonProps {
  editor: { url: string; name?: string }
  index: number
}

export const createUrl = (editorUrl: string) => {
  let baseURL: string = 'http://'

  if (import.meta.env.VITE_APP_ENVIRONMENT === 'development') {
      baseURL = import.meta.env.VITE_APP_DEV_CORE_URL || ''
  } else {
      baseURL = baseURL.concat(window.location.host)
  }

  return baseURL + '/api' + editorUrl
}

export const EditorButton: React.FC<EditorButtonProps> = ({
  editor,
  index,
}: EditorButtonProps) => {

  return (
    <React.Fragment>
      <ButtonGroup disableElevation variant='contained' sx={{ m: 1 }}>
      <Tooltip title={`Open ${editor.name || 'editor'} in a new tab`}>
          <Button
          aria-label={`open-editor-button-${index}`}
          onClick={() => window.open(createUrl(editor.url))}
          startIcon={<LaunchIcon />}
          >
          {`Open ${editor.name || 'editor'}`}
          </Button>
      </Tooltip>
      </ButtonGroup>
    </React.Fragment>
  )
}
