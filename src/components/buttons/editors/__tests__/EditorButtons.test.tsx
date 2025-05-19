/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed May 15 2025
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
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { EditorButtons } from '../EditorButtons'
import { AppInstance } from '../../../../api/device/instances/instance'

const testInstance: AppInstance = {
  editors: [{ name: 'Editor 1', url: '/editor', supportsReverseProxy: false , port: 80}],
  appKey: { name: 'com.test.app', version: '1.1.0' },
  desired: 'running',
  status: 'running',
  instanceId: '1234',
  instanceName: 'testInstance'
}

const noEditorInstance: AppInstance = {
  editors: [],
  appKey: { name: 'com.test.app', version: '1.1.0' },
  desired: 'running',
  status: 'running',
  instanceId: '1234',
  instanceName: 'testInstance'
}

const multipleEditorsInstance: AppInstance = {
  editors: [
    { name: 'Editor 1', url: '/editor-1', supportsReverseProxy: false , port: 99 },
    { name: 'Editor 2', url: '/editor-2', supportsReverseProxy: false , port: 77 }
  ],
  appKey: { name: 'com.test.app', version: '1.1.0' },
  desired: 'running',
  status: 'running',
  instanceId: '1234',
  instanceName: 'testInstance'
}

describe('OpenEditorButtons', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    process.env = { ...originalEnv }
    window.open = jest.fn()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('renders single button when exactly one editor is present', () => {
    const { getByLabelText } = render(
      <EditorButtons instance={testInstance}/>
    )
    expect(getByLabelText('open-editor-button-0')).toBeInTheDocument()
    expect(screen.queryByLabelText('open-editor-button-multi')).toBeNull()
  })

  it('renders multiple buttons when more than one editor is present', () => {
    render(<EditorButtons instance={multipleEditorsInstance}/>)
    expect(screen.getByLabelText('open-editor-button-multi')).toBeInTheDocument()
    expect(screen.queryByLabelText('open-editor-button-0')).toBeNull()
  })

  it('renders no buttons when no editor is present', () => {
    render(<EditorButtons instance={noEditorInstance}/>)
    expect(screen.queryByLabelText('open-editor-button-0')).toBeNull()
    expect(screen.queryByLabelText('open-editor-button-multi')).toBeNull()
  })

  it('opens editor URL in new window on button click in development environment', () => {
    process.env.REACT_APP_ENVIRONMENT = 'development'
    process.env.REACT_APP_DEV_CORE_URL = 'http://localhost:3000'
    render(<EditorButtons instance={testInstance} />)
    fireEvent.click(screen.getByLabelText('open-editor-button-0'))
    expect(window.open).toHaveBeenCalledWith('http://localhost:3000/api/editor')
  })

  it('opens editor URL in new window on button click in production environment', () => {
    process.env.REACT_APP_ENVIRONMENT = 'production'
    delete process.env.REACT_APP_DEV_CORE_URL
    render(<EditorButtons instance={testInstance} />)
    fireEvent.click(screen.getByLabelText('open-editor-button-0'))
    expect(window.open).toHaveBeenCalledWith(
      `http://${window.location.hostname}/api/editor`
    )
  })
})
