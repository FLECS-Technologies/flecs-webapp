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
import React from 'react'
import PropTypes from 'prop-types'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import CheckIcon from '@mui/icons-material/CheckCircle'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import ErrorIcon from '@mui/icons-material/Error'
import { Alert, AlertTitle, Badge, Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Grid, LinearProgress, Typography } from '@mui/material'
import { MarketplaceAPIConfiguration } from '../api/api-config'
import { addToCart } from '../api/Cart'
import ActionSnackbar from './ActionSnackbar'
import { getCurrentUserLicenses } from '../api/LicenseService'

export default function SelectTicket (props) {
  const { app, tickets, setTickets } = (props)
  const [reloadTickets, setReloadTickets] = React.useState(false)
  const [loadingCart, setLoadingCart] = React.useState(false)
  const [loadingTickets, setLoadingTickets] = React.useState(false)
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarState, setSnackbarState] = React.useState({
    snackbarText: 'Info',
    alertSeverity: 'success'
  })

  const redirectToCart = async (props) => {
    setLoadingCart(true)
    let url = ''
    let cartKey = ''
    addToCart(MarketplaceAPIConfiguration.MP_INSTALL_TICKET_ID)
      .then((response) => {
        cartKey = response
        if (process.env.NODE_ENV === 'development') {
          url = process.env.REACT_APP_DEV_MP_URL
        } else {
          url = MarketplaceAPIConfiguration.BETA_BASE_URL
        }

        if (cartKey) {
          url = url + MarketplaceAPIConfiguration.MP_CART_ROUTE + cartKey
        }
        window.open(url)
      })
      .catch((error) => {
        setSnackbarState({
          alertSeverity: 'error',
          snackbarText: error?.response?.data?.message
        })
        setSnackbarOpen(true)
      })
      .finally(() => {
        setLoadingCart(false)
      })
  }

  React.useEffect(() => {
    fetchTickets()
    if (reloadTickets) {
      setReloadTickets(false)
    }
  }, [reloadTickets])

  const fetchTickets = async (props) => {
    setLoadingTickets(true)
    getCurrentUserLicenses()
      .then((response) => {
        setTickets(response)
      })
      .catch((error) => {
        setSnackbarState({
          alertSeverity: 'error',
          snackbarText: error?.response?.data?.message
        })
        setSnackbarOpen(true)
      })
      .finally(() => {
        setLoadingTickets(false)
      })
  }
  return (
    <Grid data-testid='select-ticket-step' container direction="row" style={{ minHeight: 350, marginTop: 16 }} justifyContent="space-around">
        <Grid item xs={12}>
            <Alert sx={{ mb: 2 }} severity='info'>
                <AlertTitle>Info</AlertTitle>
                <Typography variant='body2'>To install or update an app, an installation ticket is required.</Typography>
                <Typography variant='body2'>Get started with 3 (three) included tickets per month.</Typography>
                <Typography variant='body2'>To purchase a ticket please select &apos;Purchase installation ticket&apos;.</Typography>
                <Typography variant='body2'>If you already have a ticket, you can simply continue with the &apos;next&apos;.</Typography>
            </Alert>
        </Grid>
        <Grid item>
            <Card data-testid='open-cart-card' sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', minWidth: 300, maxWidth: 300, minHeight: 230, maxHeight: 230 }}>
                <CardActionArea data-testid='open-cart-card-action' sx={{ minHeight: 230, maxHeight: 230 }} onClick={redirectToCart} disabled={loadingCart}>
                  <CardMedia sx={{ m: 2, display: 'flex', justifyContent: 'center' }}>
                    <Card sx={{ p: 3 }} variant='outlined'>
                      <ShoppingCartIcon color='primary' fontSize='large'/>
                    </Card>
                  </CardMedia>
                  {loadingCart && <LinearProgress color='primary'/>}
                  <CardContent sx={{ m: 2, p: '2px 4px', display: 'flex', alignItems: 'center' }}>
                      <Typography align='center' sx={{ ml: 1, flex: 1 }}>Purchase installation ticket for {app?.title}.</Typography>
                  </CardContent>
                </CardActionArea>
            </Card>
        </Grid>
        <Grid item>
            <Card sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', minWidth: 300, maxWidth: 300, minHeight: 230, maxHeight: 230 }}>
              <CardContent sx={{ p: 0, minHeight: 230, maxHeight: 230 }}>
                  <CardMedia sx={{ m: 2, display: 'flex', justifyContent: 'center' }}>
                  <Badge badgeContent={tickets ? <CheckIcon fontSize='small' color='success'/> : <ErrorIcon fontSize='small' color='error'/>}>
                    <Card sx={{ p: 3 }} variant='outlined' >
                        <ConfirmationNumberIcon color='primary' fontSize='large'/>
                    </Card>
                    </Badge>
                  </CardMedia>
                  {loadingTickets && <LinearProgress></LinearProgress>}
                  <CardContent sx={{ m: 2, p: '2px 4px', display: 'flex', alignItems: 'center' }}>
                    { tickets
                      ? (<Typography align='center' sx={{ ml: 1, flex: 1 }}>{tickets?.length} Tickets available.</Typography>)
                      : (<Typography align='center' sx={{ ml: 1, flex: 1 }}>No tickets available.</Typography>)
                    }
                  </CardContent>
                  <CardActions>
                    <Button onClick={() => setReloadTickets(true)} disabled={loadingTickets}>Refresh</Button>
                  </CardActions>
                </CardContent>
            </Card>
        </Grid>
        <ActionSnackbar
          text={snackbarState.snackbarText}
          open={snackbarOpen}
          setOpen={setSnackbarOpen}
          alertSeverity={snackbarState.alertSeverity}/>
    </Grid>)
}

SelectTicket.propTypes = {
  app: PropTypes.object,
  tickets: PropTypes.array,
  setTickets: PropTypes.func
}
