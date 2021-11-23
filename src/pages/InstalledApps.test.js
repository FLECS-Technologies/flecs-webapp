import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import InstalledApps from './InstalledApps'

describe('Installed Apps', () => {
  test('renders installed apps page', () => {
    render(<InstalledApps />)

    expect(screen.getByLabelText('installed-apps-list')).toBeVisible()

    // screen.debug()
  })
})
