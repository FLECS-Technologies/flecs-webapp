import React from 'react'

import { BrowserRouter as Router } from 'react-router-dom'
import { render /*, screen */ } from '@testing-library/react'
import '@testing-library/jest-dom'

import App from './App'

describe('App', () => {
  test('renders App component', () => {
    render(
      <Router>
        <App />
      </Router>
    )

    // screen.debug()
  })
})
