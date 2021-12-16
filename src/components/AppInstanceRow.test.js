/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Nov 30 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AppInstanceRow from './AppInstanceRow'

describe('AppInstanceRow', () => {
  function loadReferenceData () {}
  test('render running instance and stop instance', () => {
    const { getByLabelText } = render(<AppInstanceRow
      loadAppReferenceData = {loadReferenceData}
      app={
        { multiInstance: true }
      }
      appInstance={
        {
          instanceId: '01234567',
          instanceName: 'Smarthome',
          status: 'running',
          version: 'Test App Version'
        }
      }/>
    )
    const stopButton = getByLabelText('stop-instance-button')
    const startButton = getByLabelText('start-instance-button')
    const deleteButton = getByLabelText('delete-instance-button')

    fireEvent.click(stopButton)

    expect(stopButton).toBeDisabled()
    expect(startButton).toBeVisible()
    expect(deleteButton).toBeVisible()
  })

  test('render running instance and delete instance', () => {
    const { getByLabelText } = render(<AppInstanceRow
      loadAppReferenceData = {loadReferenceData}
      app={
        { multiInstance: true }
      }
      appInstance={
        {
          instanceId: '01234567',
          instanceName: 'Smarthome',
          status: 'running',
          version: 'Test App Version'
        }
      }/>
    )
    const stopButton = getByLabelText('stop-instance-button')
    const startButton = getByLabelText('start-instance-button')
    const deleteButton = getByLabelText('delete-instance-button')

    fireEvent.click(deleteButton)

    expect(stopButton).toBeVisible()
    expect(startButton).toBeVisible()
    expect(deleteButton).toBeVisible()
  })

  test('render stopped instance and start instance', () => {
    const { getByLabelText } = render(<AppInstanceRow
      loadAppReferenceData = {loadReferenceData}
      app={
        { multiInstance: true }
      }
      appInstance={
        {
          instanceId: '01234567',
          instanceName: 'Smarthome',
          status: 'stopped',
          version: 'Test App Version'
        }
      }/>
    )
    const stopButton = getByLabelText('stop-instance-button')
    const startButton = getByLabelText('start-instance-button')
    const deleteButton = getByLabelText('delete-instance-button')

    fireEvent.click(startButton)

    expect(stopButton).toBeVisible()
    expect(startButton).toBeDisabled()
    expect(deleteButton).toBeVisible()
  })

  test('renders an instance with an editor', () => {
    const closeSpy = jest.fn()
    window.open = jest.fn().mockReturnValue({ close: closeSpy })

    const { getByLabelText } = render(<AppInstanceRow
      loadAppReferenceData = {loadReferenceData}
      app={
        {
          multiInstance: true,
          editor: ':8080'
        }
      }
      appInstance={
        {
          instanceId: '01234567',
          instanceName: 'Smarthome',
          status: 'running',
          version: 'Test App Version'
        }
      }/>
    )

    const editorButton = getByLabelText('open-editor-button')
    const stopButton = getByLabelText('stop-instance-button')
    const startButton = getByLabelText('start-instance-button')
    const deleteButton = getByLabelText('delete-instance-button')

    fireEvent.click(editorButton)

    expect(editorButton).toBeEnabled()
    expect(stopButton).toBeVisible()
    expect(startButton).toBeVisible()
    expect(deleteButton).toBeVisible()
    expect(window.open).toHaveBeenCalled()
    expect(window.open).toHaveBeenCalledWith(':8080')
  })
})
