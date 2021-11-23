import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import Drawer from './Drawer'

describe('Drawer', () => {
  test('renders Drawer component', () => {
    render(
      <Router>
        <Drawer />
      </Router>
    )

    expect(screen.getByText('Apps')).toBeVisible()
    expect(screen.getByText('Marketplace')).toBeVisible()
    expect(screen.getByText('System')).toBeVisible()

    // screen.debug()
  })
})
