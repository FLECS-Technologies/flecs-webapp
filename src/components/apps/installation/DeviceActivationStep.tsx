/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Jan 30 2024
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
import PropTypes, { InferProps } from 'prop-types'
import React from 'react'
import { DeviceActivationContext } from '../../providers/DeviceActivationContext'
import { Grid } from '@mui/material'
import DeviceActivation from '../../device/DeviceActivation'

function DeviceActivationStep(
  props: InferProps<typeof DeviceActivationStep.propTypes>
) {
  const { handleNext } = props
  const { activated } = React.useContext(DeviceActivationContext)

  React.useEffect(() => {
    if (activated && handleNext) {
      handleNext()
    }
  }, [activated])

  return (
    <Grid
      data-testid='device-activation-step'
      container
      direction='column'
      spacing={1}
      style={{ minHeight: 350, marginTop: 16 }}
      justifyContent='center'
      alignItems='center'
    >
      <Grid>
        <DeviceActivation></DeviceActivation>
      </Grid>
    </Grid>
  )
}

DeviceActivationStep.propTypes = {
  handleNext: PropTypes.func
}

export default DeviceActivationStep
