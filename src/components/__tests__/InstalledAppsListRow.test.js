import React from 'react'
import '@testing-library/jest-dom'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import Row from '../InstalledAppsListRow'
import { JobsContextProvider } from '../../data/JobsContext'

jest.mock('../../api/device/AppAPI')

describe('Test Installed Apps List row', () => {
  const app = {
    appKey: {
      name: 'com.codesys.codesyscontrol',
      version: '4.2.0'
    },
    status: 'installed',
    editor: ':8080',
    multiInstance: true,
    instances: [
      {
        instanceId: 'com.codesys.codesyscontrol.01234567',
        instanceName: 'Smarthome',
        status: 'running',
        appKey: {
          version: '4.2.0'
        },
        editors: [{ name: 'editor', url: '/editor-0', port: 200 }]
      },
      {
        instanceId: 'com.codesys.codesyscontrol.12345678',
        instanceName: 'Energymanager',
        status: 'stopped',
        appKey: {
          version: '4.2.0'
        },
        editors: [{ name: 'editor', url: '/editor-1', port: 201 }]
      }
    ]
  }

  afterAll(() => {
    jest.clearAllMocks()
  })

  test('renders installed apps list row component', async () => {
    render(
      <JobsContextProvider>
        <table>
          <tbody>
            <Row key={app.appKey.name} row={app} />
          </tbody>
        </table>
      </JobsContextProvider>
    )

    const crtInstnButton = await waitFor(() =>
      screen.getByTestId('start-new-instance-icon-button-icon')
    )
    const deleteButton = screen.getByTestId('DeleteIcon')

    expect(crtInstnButton).toBeVisible()
    expect(deleteButton).toBeVisible()
  })

  test('create new instance', async () => {
    render(
      <JobsContextProvider>
        <table>
          <tbody>
            <Row key={app.appKey.name} row={app} />
          </tbody>
        </table>
      </JobsContextProvider>
    )

    const crtInstnButton = await waitFor(() =>
      screen.getByTestId('start-new-instance-icon-button-icon')
    )
    const deleteButton = screen.getByTestId('DeleteIcon')

    fireEvent.click(crtInstnButton)

    await waitFor(() => {
      expect(crtInstnButton).toBeVisible()
      expect(deleteButton).toBeVisible()
    })
  })

  test('test delete app', async () => {
    render(
      <JobsContextProvider>
        <table>
          <tbody>
            <Row key={app.appKey.name} row={app} />
          </tbody>
        </table>
      </JobsContextProvider>
    )

    const deleteButton = await waitFor(() => screen.getByTestId('DeleteIcon'))
    fireEvent.click(deleteButton)

    const yesButton = await waitFor(() => screen.getByText('Yes'))
    fireEvent.click(yesButton)

    await waitFor(() => {
      const createInstanceButton = screen.getByTestId(
        'start-new-instance-icon-button-icon'
      )
      expect(createInstanceButton).toBeVisible()
      expect(deleteButton).toBeVisible()
    })
  })

  test('test app with documentation url', async () => {
    app.documentationUrl = 'https://google.com'

    render(
      <JobsContextProvider>
        <table>
          <tbody>
            <Row key={app.appKey.name} row={app} />
          </tbody>
        </table>
      </JobsContextProvider>
    )

    const documentationButton = await waitFor(() =>
      screen.getByTestId('HelpCenterIcon')
    )

    expect(documentationButton).toBeVisible()
  })

  test('test app without documentation url', async () => {
    app.documentationUrl = undefined

    render(
      <JobsContextProvider>
        <table>
          <tbody>
            <Row key={app.appKey.name} row={app} />
          </tbody>
        </table>
      </JobsContextProvider>
    )

    await waitFor(() => {
      expect(() => screen.getByTestId('HelpCenterIcon')).toThrow()
    })
  })

  test('renders an app with an editor', async () => {
    const closeSpy = jest.fn()
    window.open = jest.fn().mockReturnValue({ close: closeSpy })

    render(
      <JobsContextProvider>
        <table>
          <tbody>
            <Row key={app.appKey.name} row={app} />
          </tbody>
        </table>
      </JobsContextProvider>
    )

    const expandButton = await waitFor(() =>
      screen.getByLabelText('expand row')
    )
    fireEvent.click(expandButton)

    const editorButtons = await waitFor(() =>
      screen.getAllByLabelText('open-editor-button-0')
    )
    expect(editorButtons.length).toBe(2)
    const editorButton1 = editorButtons[1]
    fireEvent.click(editorButton1)

    expect(editorButton1).toBeEnabled()
    expect(window.open).toHaveBeenCalled()
    expect(window.open).toHaveBeenCalledWith('http://localhost/api/editor-1')
    const editorButton0 = editorButtons[0]
    fireEvent.click(editorButton0)

    expect(editorButton0).toBeEnabled()
    expect(window.open).toHaveBeenCalled()
    expect(window.open).toHaveBeenCalledWith('http://localhost/api/editor-0')
  })
})
