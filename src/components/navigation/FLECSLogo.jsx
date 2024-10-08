/*
 * Copyright (c) 2024 FLECS Technologies GmbH
 *
 * Created on Tue Oct 08 2024
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
import { ReactComponent as Logo } from './logo.svg' // Importing as a React component
import { useTheme } from '@mui/material/styles'

export default function FLECSLogo() {
  const theme = useTheme() // Access the Material-UI theme

  return (
    <Logo
      width='24'
      height='24'
      style={{ color: theme.palette.primary.main }} // Set the "color" property for currentColor
    />
  )
}
