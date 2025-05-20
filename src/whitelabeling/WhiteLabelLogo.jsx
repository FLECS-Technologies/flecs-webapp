/*
 * Copyright (c) 2024 FLECS Technologies GmbH
 *
 * Created on Mon May 19 2025
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
import { ReactComponent as Logo } from '../assets/images/logo.svg' // Change to the custom whitelabel logo
import { useTheme } from '@mui/material/styles'
import PropTypes from 'prop-types'

// Set to true if the whitelabel logo should be used
export const useWhiteLabelLogo = false;
// Set to false if 'powered by flecs' should not be shown
export const showPoweredBy = true;

export default function WhiteLabelLogo({ logoColor }) {
  const theme = useTheme() // Access the Material-UI theme
  // Customize the whitelabel logo here
  return (
    <Logo
      width='128'
      height='48'
      style={{ color: logoColor || theme.palette.primary.main }} // Set the "color" property for currentColor
    />
  )
}

WhiteLabelLogo.propTypes = {
  logoColor: PropTypes.string
}
