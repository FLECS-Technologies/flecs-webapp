import React from 'react'
import { render /*, screen */ } from '@testing-library/react'
import '@testing-library/jest-dom'
import DeviceAppsList from './InstalledAppsList'

describe('Test Installed Apps List', () => {
  test('renders installed apps list component', () => {
    render(<DeviceAppsList />)

    // screen.debug()
  })
})
