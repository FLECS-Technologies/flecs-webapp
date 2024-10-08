import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, useSearchParams } from 'react-router-dom'
import PoweredByFLECS from '../PoweredBy'
import '@testing-library/jest-dom'

jest.mock('../FLECSLogo', () => () => <div>FLECSLogo</div>)

// Mock the useSearchParams hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: jest.fn()
}))

describe('PoweredByFLECS', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should render the "Powered by FLECS" link when visible', () => {
    // Mock the searchParams to simulate 'hideAppBar' being absent (null)
    ;(useSearchParams as jest.Mock).mockReturnValue([
      { get: () => 'true' },
      jest.fn()
    ])

    render(
      <MemoryRouter>
        <PoweredByFLECS />
      </MemoryRouter>
    )

    // Use getByLabelText to find the link
    const linkElement = screen.getByLabelText('powered-by-link')
    expect(linkElement).toBeInTheDocument()
    expect(linkElement).toHaveAttribute('href', 'https://flecs.tech')
    expect(linkElement).toHaveAttribute('target', '_blank')
    expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer')

    // Ensure the FLECSLogo is present
    expect(screen.getByText('FLECSLogo')).toBeInTheDocument()
  })

  test('should not render the "Powered by FLECS" link when hideAppBar is set in the query params', () => {
    // Mock the searchParams to simulate 'hideAppBar' being set to 'true'
    ;(useSearchParams as jest.Mock).mockReturnValue([
      { get: () => 'false' },
      jest.fn()
    ])

    render(
      <MemoryRouter>
        <PoweredByFLECS />
      </MemoryRouter>
    )

    // The link should not be rendered when hideAppBar is set
    const linkElement = screen.queryByLabelText('powered-by-link')
    expect(linkElement).not.toBeInTheDocument()
  })
})
