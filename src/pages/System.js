import React from 'react'
import styled from 'styled-components'

const Header = styled.div`
  display: 'flex';
  alignItems: 'center';
  justifyContent: 'flex-end';
  padding: 32px 32px;
`

const System = () => {
  const data = (
    <div aria-label='system-page' className="box">
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
