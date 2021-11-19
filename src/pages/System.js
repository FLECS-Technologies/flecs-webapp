import React from 'react'
import { styled } from '@mui/styles'

const Header = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  minHeight: '48', // if minHeight is not set to 48 (or any other value), a minHeight of 64px is used, which makes the menu move down.
  // padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar
}))

const System = () => {
  const data = (
    <div className="box">
      <h2>System Setting</h2>
      <p>You will find the system settings here soon.</p>
    </div>
  )
  return (
    <div>
      <Header/>
      {data}
    </div>
  )
}

export default System
