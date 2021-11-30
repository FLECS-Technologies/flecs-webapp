import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import RequestAppDialog from './RequestAppDialog'

describe('RequestAppDialog', () => {
  test('renders RequestAppDialog component', () => {
    render(
        <RequestAppDialog
            open={true}
            appTitle = 'Testapp'
            appVendor = 'Test-vendor'
        />
    )
    expect(screen.getByText('Cancel')).toBeVisible()
    expect(screen.getByText('Send Request')).toBeVisible()
    expect(screen.getByLabelText('Name')).toBeVisible()
    expect(screen.getByLabelText('E-Mail')).toBeVisible()

    // screen.debug()
  })
})
