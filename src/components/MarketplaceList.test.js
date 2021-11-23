import React from 'react'
import { render /*, screen */ } from '@testing-library/react'
import '@testing-library/jest-dom'
// import { marketPlaceAppsList } from '../data/MarketPlaceAppsList'
import MPList from './MarketplaceList'

describe('Marketplace List', () => {
  test('renders marketplace list component', () => {
    render(<MPList /* appData={marketPlaceAppsList} */ />)

    // screen.debug()
  })
})
