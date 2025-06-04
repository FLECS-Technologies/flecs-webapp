/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Jun 03 2025
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
import { BoxProps, Box, CircularProgress } from "@mui/material";

interface LoadingProps extends BoxProps {
  loading: boolean,
  children?: React.ReactNode
}

export const Loading: React.FC<LoadingProps> = ({loading, children, ...boxProps}: LoadingProps) => {
    return <Box {...boxProps} sx={{ position: 'relative' }}>
      {children}
      {loading && (<CircularProgress data-testid="circularprogress" size={16} sx={{
        color: 'info',
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: '-7px',
        marginLeft: '-7px'
      }}/>)}
    </Box>;
}