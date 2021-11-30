import React from 'react'
import { render /*, screen */ } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import '@testing-library/jest-dom'
import Frame from './Frame'
import { DarkModeState } from './ThemeHandler'

describe('Frame', () => {
  test('renders Frame component', () => {
    render(
        <Router>
            <DarkModeState>
                <Frame />
            </DarkModeState>
        </Router>
    )
    // screen.debug()
  })
})
