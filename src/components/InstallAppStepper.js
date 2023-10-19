/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Feb 03 2022
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
import * as React from 'react'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import InstallApp from './InstallApp'
import SideloadApp from './SideloadApp'
import UpdateApp from './UpdateApp'

const steps = ['Getting ready', 'Installing', 'All done']

export default function InstallAppStepper (props) {
  const { app, version, sideload, update } = props
  const [activeStep, setActiveStep] = React.useState(0)

  const handleActiveStep = (status) => {
    setActiveStep(status)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper data-testid='install-app-stepper' activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {}
          const labelProps = {}
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          )
        })}
      </Stepper>
        <React.Fragment>
          {(!(sideload || update)) && <InstallApp app={app} version={version || app?.appKey.version} handleActiveStep={handleActiveStep} />}
          {(sideload) && <SideloadApp yaml={app} handleActiveStep={handleActiveStep} />}
          {(update) && <UpdateApp app={app} from={app?.installedVersions[0]} to={version} handleActiveStep={handleActiveStep} />}
        </React.Fragment>
    </Box>
  )
}

InstallAppStepper.propTypes = {
  app: PropTypes.object,
  version: PropTypes.string,
  sideload: PropTypes.bool,
  update: PropTypes.bool
}
