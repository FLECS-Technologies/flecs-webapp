/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Sep 30 2022
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
import { IconButton, Typography } from '@mui/material'
import { ReactComponent as LogoSVG } from './logo.svg'
import { ReactComponent as SALZLogo } from './salz-logo-white-full.svg'

export default function Logo () {
  return (
        <React.Fragment>
            <IconButton aria-label='SALZ-Logo' disabled={true}>
              <SALZLogo width="48" height="48" />
            </IconButton>
            <Typography variant="caption" component="div" sx={{ flexGrow: 1 }}>
              powered by
              <IconButton aria-label='FLECS-Logo' disabled={true}>
              <LogoSVG width="16" height="16" />
            </IconButton>
              <Typography variant="caption">
                 FLECS
              </Typography>
            </Typography>
        </React.Fragment>
  )
}
