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
import Button from '@mui/material/Button'
import SelectTicket from './SelectTicket'
import InstallApp from './InstallApp'
import SideloadApp from './SideloadApp'
import UpdateApp from './UpdateApp'

const steps = ['Checking tickets', 'Getting ready', 'Installing', 'All done']

export default function InstallAppStepper (props) {
  const { app, version, sideload, update } = props
  const [begin, setBegin] = React.useState(false)
  const [tickets, setTickets] = React.useState([])
  const [activeStep, setActiveStep] = React.useState(0)

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
    setBegin(true)
  }

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
          {(!begin) && <SelectTicket app={app} tickets={tickets} setTickets={setTickets}/>}
          {(begin && !(sideload || update)) && <InstallApp app={app} version={version || app?.appKey.version} tickets={tickets} install={(begin)} handleActiveStep={handleActiveStep} />}
          {(begin && sideload) && <SideloadApp yaml={app} tickets={tickets} install={(begin)} handleActiveStep={handleActiveStep} />}
          {(begin && update) && <UpdateApp app={app} from={app.appKey.version} to={version} tickets={tickets} update={(begin)} handleActiveStep={handleActiveStep} />}
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Box sx={{ flex: '1 1 auto' }} />
            {!begin
              ? <Button data-testid='next-button' variant='contained' onClick={handleNext} disabled={tickets.length === 0} >
                  Next
                </Button>
              : null
            }
          </Box>
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
