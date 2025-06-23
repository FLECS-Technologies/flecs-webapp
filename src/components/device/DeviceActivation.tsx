/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Jan 30 2024
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
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Grid,
  Typography
} from '@mui/material'
import { DeviceActivationContext } from '../providers/DeviceActivationContext'
import { CheckCircle, Error } from '@mui/icons-material'
import PropTypes, { InferProps } from 'prop-types'

function DeviceActivation(
  props: InferProps<typeof DeviceActivation.propTypes>
) {
  const { variant } = props
  const {
    validate,
    validating,
    activated,
    activate,
    activating,
    error,
    statusText
  } = React.useContext(DeviceActivationContext)
  const [infoText, setInfoText] = React.useState('')

  React.useEffect(() => {
    if (validating) {
      setInfoText('Checking the device activation status...')
    } else if (activating) {
      setInfoText('Activating the device...')
    } else if (activated) {
      setInfoText('Device is activated!')
    } else if (!activated && !error) {
      setInfoText('Device is not activated!')
    } else if (error) {
      setInfoText(
        statusText ||
          'Failed to check activation status! Please login with your account and try again.'
      )
    }
  }, [activated, validating, activating])

  const renderIcon = () => {
    let minHeight = 100
    let minWidth = 100
    if (variant === 'line') {
      minHeight = 24
      minWidth = 24
    }
    if (validating || activating) {
      return (
        <CircularProgress
          sx={{ minHeight: { minHeight }, minWidth: { minWidth } }}
        ></CircularProgress>
      )
    }
    if (activated) {
      return (
        <CheckCircle
          color='success'
          sx={{ minHeight: { minHeight }, minWidth: { minWidth } }}
        ></CheckCircle>
      )
    } else {
      return (
        <Error
          color='warning'
          sx={{ minHeight: { minHeight }, minWidth: { minWidth } }}
        ></Error>
      )
    }
  }

  const renderButton = () => {
    return (
      <Button
        variant='contained'
        onClick={activate}
        disabled={validating || activating || activated || error}
      >
        Activate Device
      </Button>
    )
  }

  return (
    <React.Fragment>
      {(!variant || variant === 'card') && (
        <Card
          data-testid='device-activation-card'
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            minWidth: 300,
            maxWidth: 300,
            minHeight: 260
          }}
        >
          <CardMedia>{renderIcon()}</CardMedia>
          <CardContent>
            <Typography variant='body2' color='text.secondary'>
              {infoText}
            </Typography>
          </CardContent>
          <CardActions>{renderButton()}</CardActions>
        </Card>
      )}
      {variant === 'line' && (
        <Grid container direction='row' spacing={5} alignItems='center'>
          <Grid>{renderIcon()}</Grid>
          <Grid>
            <Typography variant='body2' color='text.secondary'>
              {infoText}
            </Typography>
          </Grid>
          <Grid>{renderButton()}</Grid>
        </Grid>
      )}
    </React.Fragment>
  )
}

DeviceActivation.propTypes = {
  variant: PropTypes.string
}

export default DeviceActivation
