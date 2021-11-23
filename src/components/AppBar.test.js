import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AppBar from './AppBar'

describe('AppBar', () => {
  test('renders AppBar component', () => {
    render(<AppBar />)

    // test if logo is there
    expect(screen.getByLabelText('FLECS-Logo')).toBeVisible()
    // test if FLECS brand name is there
    expect(screen.getByText('FLECS')).toBeVisible()
    // screen.debug()
  })

  test('Select user avatar', async () => {
    render(<AppBar />)

    fireEvent.click(screen.getByLabelText('account of current user'))

    await waitFor(() => screen.getByText('Profile'))

    expect(screen.getByText('Profile')).toBeVisible()
    expect(screen.getByText('Sign out')).toBeVisible()

    // screen.debug()
  })
})
