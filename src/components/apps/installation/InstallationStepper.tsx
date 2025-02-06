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
import PropTypes, { InferProps } from 'prop-types'
import InstallApp from './InstallApp'
import SideloadApp from './SideloadApp'
import UpdateApp from './UpdateApp'
import { Box, Step, StepLabel, Stepper } from '@mui/material'
import DeviceActivationStep from './DeviceActivationStep'
import { App } from '../../../models/app'

const steps = ['Check Device Activation', 'Installing', 'Done']

function InstallationStepper(
  props: InferProps<typeof InstallationStepper.propTypes>
) {
  const { app, version, sideload, update } = props
  const myApp = app as App
  const [activeStep, setActiveStep] = React.useState(0)

  const handleNext = (status?: number) => {
    if (!status) {
      setActiveStep(activeStep + 1)
    } else {
      setActiveStep(status)
    }
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <DeviceActivationStep handleNext={handleNext} />
      case -1:
      case 1:
      case 2:
      case 3:
      case 4:
        if (!(sideload || update)) {
          return (
            <InstallApp
              app={app}
              version={version || myApp?.appKey.version}
              handleActiveStep={handleNext}
            />
          )
        } else if (sideload) {
          return <SideloadApp yaml={app} handleActiveStep={handleNext} />
        } else if (update) {
          return (
            <UpdateApp
              app={app}
              from={myApp?.installedVersions[0]}
              to={version}
              handleActiveStep={handleNext}
            />
          )
        } else {
          return <div>Not Found</div>
        }
      default:
        return <div>Not Found</div>
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <React.Fragment>{renderStepContent(activeStep)}</React.Fragment>
    </Box>
  )
}

InstallationStepper.propTypes = {
  app: PropTypes.objectOf(PropTypes.any),
  version: PropTypes.string,
  sideload: PropTypes.bool,
  update: PropTypes.bool
}

export default InstallationStepper
