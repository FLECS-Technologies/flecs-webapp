/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Aug 12 2022
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
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import { IconButton, Rating, Typography } from '@mui/material'
import { createAppRating } from '../api/AppRatingService'
import { Cancel, CheckCircle } from '@mui/icons-material'
import { useAuth } from '../components/AuthProvider'
import ActionSnackbar from './ActionSnackbar'
import { jwt } from '../api/auth-header'

export default function AppRating (props) {
  const { app } = props
  const user = useAuth()
  const [value, setValue] = React.useState(Number(app?.average_rating))
  const [rated, setRated] = React.useState(false)
  const [save, setSave] = React.useState(false)
  const [savingAppRating, setSavingAppRating] = React.useState(false)
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarState, setSnackbarState] = React.useState({
    snackbarText: 'Info',
    alertSeverity: 'success',
    clipBoardContent: ''
  })

  React.useEffect(() => {
    if (save && !savingAppRating) {
      setSave(false)
      saveAppRating(value)
    }
  }, [save])

  const saveAppRating = async (props) => {
    setSavingAppRating(true)

    createAppRating(app?.id, user?.user?.user?.data?.display_name, user?.user?.user?.data?.user_email, value, jwt())
      .then((response) => {
        setSnackbarState({
          alertSeverity: 'success',
          snackbarText: 'Thanks for rating ' + app?.title
        })
      })
      .catch((error) => {
        setSnackbarState({
          alertSeverity: 'error',
          snackbarText: error?.response?.data?.error
        })
      })
      .finally(() => {
        setValue(Number(app?.average_rating))
        setSavingAppRating(false)
        setSnackbarOpen(true)
        setRated(false)
      })
  }

  return (
    <Fragment>
        <Rating
            size="small"
            value={value}
            onChange={(event, newValue) => {
              setValue(newValue)
              setRated(true)
            }}
        ></Rating>
        <Typography variant="subtitle">({app?.rating_count})</Typography>
        {rated &&
        <Fragment>
          <IconButton
            size="small"
            disabled={savingAppRating}
            onClick={() => {
              setSave(true)
            }}>
              <CheckCircle
                  fontSize='inherit'
                  ></CheckCircle>
          </IconButton>
          <IconButton
            size="small"
            disabled={savingAppRating}
            onClick={() => {
              setRated(false)
              setValue(Number(app?.average_rating))
            }}>
              <Cancel
                  fontSize='inherit'
                  ></Cancel>
          </IconButton>
        </Fragment>}
        <ActionSnackbar
          text={snackbarState.snackbarText}
          open={snackbarOpen}
          setOpen={setSnackbarOpen}
          alertSeverity={snackbarState.alertSeverity}
        ></ActionSnackbar>
    </Fragment>
  )
}

AppRating.propTypes = {
  app: PropTypes.object
}
