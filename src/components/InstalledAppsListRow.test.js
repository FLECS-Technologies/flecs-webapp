import React from 'react'
import { render /*, screen */ } from '@testing-library/react'
import '@testing-library/jest-dom'
import Row from './InstalledAppsListRow'

describe('Test Installed Apps List row', () => {
  test('renders installed apps list row component', () => {
    const app = {
      app: 'com.codesys.codesyscontrol',
      status: 'installed',
      version: '4.2.0',
      instances: [
        {
          instanceId: 'com.codesys.codesyscontrol.01234567',
          instancename: 'Smarthome',
          status: 'started',
          version: '4.2.0'
        },
        {
          instanceId: 'com.codesys.codesyscontrol.12345678',
          instancename: 'Energymanager',
          status: 'stopped',
          version: '4.2.0'
        }
      ]
    }
    render(<Row
        key = {app.app}
        row = {app}
   />)

    // screen.debug()
  })
})
