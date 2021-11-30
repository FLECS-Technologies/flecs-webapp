import React from 'react'
import PropTypes from 'prop-types'
import Card from './Card'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

export default function MarketplaceList (props) {
  let appList = []
  if (props.appData) {
    appList = props.appData.map((app) => (
      <Card
        key={app.app}
        app={app.app}
        avatar={app.avatar}
        name={app.name}
        author={app.author}
        version={app.version}
        description={app.description}
        status={app.status}
        availability={app.availability}
      />
    ))
  }

  return (
  <Box aria-label="marketplace-apps-list" display="flex">
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
      >
        {appList}
      </Grid>
    </Box>
  )
}

MarketplaceList.propTypes = {
  appData: PropTypes.any,
  app: PropTypes.string,
  avatar: PropTypes.string,
  name: PropTypes.string,
  author: PropTypes.string,
  version: PropTypes.string,
  description: PropTypes.string,
  status: PropTypes.string,
  availability: PropTypes.string,
  instances: PropTypes.array
}
