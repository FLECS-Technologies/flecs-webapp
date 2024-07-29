import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { OpenAppButton } from '../OpenAppButton'
import { AppInstance } from '../../../../api/device/instances/instance'

const testInstance: AppInstance = {
  editor: '/editor',
  appKey: { name: 'com.test.app', version: '1.1.0' },
  desired: 'running',
  status: 'running',
  instanceId: '1234',
  instanceName: 'testInstance'
}

const noEditorInstance: AppInstance = {
  editor: '',
  appKey: { name: 'com.test.app', version: '1.1.0' },
  desired: 'running',
  status: 'running',
  instanceId: '1234',
  instanceName: 'testInstance'
}

describe('OpenAppButton', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    window.open = jest.fn()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('renders LoadingButton when variant is "contained"', () => {
    const { getByLabelText } = render(
      <OpenAppButton instance={testInstance} variant='contained' />
    )
    expect(getByLabelText('open-app-button')).toBeInTheDocument()
  })

  it('renders LoadIconButton when variant is "icon"', () => {
    render(<OpenAppButton instance={testInstance} variant='icon' />)
    expect(screen.getByLabelText('open-app-icon-button')).toBeInTheDocument()
  })

  it('opens editor URL in new window on button click in development environment', () => {
    process.env.REACT_APP_ENVIRONMENT = 'development'
    process.env.REACT_APP_DEV_CORE_URL = 'http://localhost:3000'
    render(<OpenAppButton instance={testInstance} variant='contained' />)
    fireEvent.click(screen.getByRole('button'))
    expect(window.open).toHaveBeenCalledWith('http://localhost:3000/api/editor')
  })

  it('opens editor URL in new window on button click in production environment', () => {
    process.env.REACT_APP_ENVIRONMENT = 'production'
    delete process.env.REACT_APP_DEV_CORE_URL
    render(<OpenAppButton instance={testInstance} variant='contained' />)
    fireEvent.click(screen.getByRole('button'))
    expect(window.open).toHaveBeenCalledWith(
      `http://${window.location.hostname}/api/editor`
    )
  })

  it('does not render button when instance.editor is not defined', () => {
    const { container } = render(
      <OpenAppButton instance={noEditorInstance} variant='contained' />
    )
    expect(container).toBeEmptyDOMElement()
  })
})
