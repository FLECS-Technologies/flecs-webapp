import React from 'react'
import PropTypes from 'prop-types'
import Card from './Card'
import Grid from '@mui/material/Grid'

export default function MarketplaceList (props) {
  let appList = []
  if (props.appData) {
    appList = props.appData.map((app) => (
      <Card
        key={app.appId}
        appId={app.appId}
        avatar={app.avatar}
        title={app.title}
        vendor={app.vendor}
        version={app.version}
        description={app.description}
        status={app.status}
        availability={app.availability}
      />
    ))
  }

  return (
    <Grid
      container
      spacing={2}
      direction="row"
      justify="flex-start"
      alignItems="flex-start"
    >
      {appList}
    </Grid>
  )
}

MarketplaceList.propTypes = {
  appData: PropTypes.any,
  appId: PropTypes.string,
  avatar: PropTypes.string,
  title: PropTypes.string,
  vendor: PropTypes.string,
  version: PropTypes.string,
  description: PropTypes.string,
  status: PropTypes.string,
  availability: PropTypes.string,
  instances: PropTypes.array
}
