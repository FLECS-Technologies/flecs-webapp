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
import Typography from '@mui/material/Typography'
import SelectTicket from './SelectTicket'
import InstallApp from './InstallApp'
import SideloadApp from './SideloadApp'
import UpdateApp from './UpdateApp'

const steps = ['Checking tickets', 'Getting ready', 'Installing', 'All done']

export default function InstallAppStepper (props) {
  const { app, version, sideload, update } = props
  const [activeStep, setActiveStep] = React.useState(0)
  const [skipped, setSkipped] = React.useState(new Set())
  const [tickets, setTickets] = React.useState([])
  const [currentJob, setCurrentJob] = React.useState({})

  const handleCurrentJob = (id, status) => {
    setCurrentJob(prevState => ({ ...prevState, id, status }))
  }

  const isStepOptional = (step) => {
    return false // step === 0
  }

  const isStepSkipped = (step) => {
    return skipped.has(step)
  }

  const handleNext = () => {
    let newSkipped = skipped
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values())
      newSkipped.delete(activeStep)
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1)
    setSkipped(newSkipped)
  }

  // const handleBack = () => {
  //   setActiveStep((prevActiveStep) => prevActiveStep - 1)
  // }

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.")
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1)
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values())
      newSkipped.add(activeStep)
      return newSkipped
    })
  }

  const getLatestJobStatus = () => {
    if (currentJob.status === 'pending') return 1
    else if (currentJob.status === 'running') return 2
    else if (currentJob.status === 'successful') return 4
    else if (currentJob.status === 'failed') return -1
    else return 0
  }

  React.useEffect(() => {
    const timer = setInterval(
      () =>
        ((activeStep === 1 || activeStep === 2) && activeStep !== getLatestJobStatus() && getLatestJobStatus() !== 0)
          ? setActiveStep(getLatestJobStatus())
          : null,
      500
    )
    return () => {
      clearInterval(timer)
    }
  })

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper data-testid='install-app-stepper' activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {}
          const labelProps = {}
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Optional</Typography>
            )
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          )
        })}
      </Stepper>
        <React.Fragment>
          {(activeStep === 0) && <SelectTicket app={app} tickets={tickets} setTickets={setTickets}/>}
          {(activeStep === 1 && !(sideload || update)) && <InstallApp handleCurrentJob={handleCurrentJob} app={app} version={version || app?.version} tickets={tickets} install={(activeStep === 1)} activeStep={activeStep} />}
          {(activeStep === 2 && !(sideload || update)) && <InstallApp handleCurrentJob={handleCurrentJob} app={app} version={version || app?.version} tickets={tickets} install={(activeStep === 1)} activeStep={activeStep} />}
          {(activeStep === 4 && !(sideload || update)) && <InstallApp handleCurrentJob={handleCurrentJob} app={app} version={version || app?.version} tickets={tickets} install={(activeStep === 1)} activeStep={activeStep} />}
          {(activeStep === -1 && !(sideload || update)) && <InstallApp app={app} version={version || app?.version} tickets={tickets} install={(activeStep === 1)} activeStep={activeStep} />}
          {(activeStep === 1 && sideload) && <SideloadApp handleCurrentJob={handleCurrentJob} yaml={app} tickets={tickets} install={(activeStep === 1)} activeStep={activeStep} />}
          {(activeStep === 2 && sideload) && <SideloadApp handleCurrentJob={handleCurrentJob} yaml={app} version={version || app?.version} tickets={tickets} install={(activeStep === 1)} activeStep={activeStep} />}
          {(activeStep === 4 && sideload) && <SideloadApp handleCurrentJob={handleCurrentJob} yaml={app} version={version || app?.version} tickets={tickets} install={(activeStep === 1)} activeStep={activeStep} />}
          {(activeStep === -1 && sideload) && <SideloadApp handleCurrentJob={handleCurrentJob} yaml={app} version={version || app?.version} tickets={tickets} install={(activeStep === 1)} activeStep={activeStep} />}
          {((activeStep === 1 || activeStep === 2 || activeStep === 4 || activeStep === -1) && update) && <UpdateApp handleCurrentJob={handleCurrentJob} getLatestJobStatus={getLatestJobStatus} app={app} from={app.version} to={version} tickets={tickets} update={(activeStep === 1)} activeStep={activeStep} />}
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            {/* <Button
              data-testid='back-button'
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button> */}
            <Box sx={{ flex: '1 1 auto' }} />
            {isStepOptional(activeStep) && (
              <Button data-testid='skip-button' color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                Skip
              </Button>
            )}
            {activeStep === 0
              ? <Button data-testid='next-button' variant='contained' onClick={handleNext} disabled={(activeStep === steps.length - 1) || (tickets.length === 0)} >
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
