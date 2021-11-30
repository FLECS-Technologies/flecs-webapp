import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Card from './Card'

describe('Card', () => {
  test('renders Card component', () => {
    render(<Card />)

    // screen.debug()
  })

  test('Click request', async () => {
    render(<Card />)

    fireEvent.click(screen.getByLabelText('app-request-button'))

    // todo: add what to expect
    // expect(screen.getByText("Profile")).toBeVisible();

    // screen.debug()
  })

  test('Click install', async () => {
    render(<Card
      app= 'Testapp'
      avatar= ''
      name= 'Test App Name'
      author= 'Test App author'
      version= 'Test App Version'
      description= 'Test App Description'
      status= 'uninstalled'
      availability='avialable'
      instances={[]} />)

    fireEvent.click(screen.getByLabelText('install-app-button'))

    // expect(screen.getByText("Profile")).toBeVisible();

    // screen.debug()
  })

  test('Click uninstall', async () => {
    render(<Card />)

    fireEvent.click(screen.getByLabelText('uninstall-app-button'))

    // todo: add what to expect
    // expect(screen.getByText("Profile")).toBeVisible();

    // screen.debug()
  })
})
