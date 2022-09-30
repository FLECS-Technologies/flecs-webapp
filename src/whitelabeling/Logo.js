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

export default function Logo () {
  return (
        <React.Fragment>
            <IconButton aria-label='logo' disabled={true}>
              <LogoSVG width="24" height="24" />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              FLECS
            </Typography>
        </React.Fragment>
  )
}
