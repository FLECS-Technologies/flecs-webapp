import React from 'react'
import { render /*, screen */ } from '@testing-library/react'
import '@testing-library/jest-dom'
import ConfirmDialog from './ConfirmDialog'

describe('Confirm Dialog', () => {
  test('renders confirm dialog component', () => {
    render(<ConfirmDialog
      open={true}
      />)

    // screen.debug()
  })
})
