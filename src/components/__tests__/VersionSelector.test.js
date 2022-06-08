/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Jun 01 2022
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
import '@testing-library/jest-dom'
import { act } from 'react-dom/test-utils'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { VersionSelector, getLatestVersion, createVersions } from '../VersionSelector'

const mockVersions = [
  {
    version: '1.3.0-porpoise-ABCDE',
    release_notes: 'https://release-notes.com',
    breaking_changes: 'https://breaking-changes.com',
    installed: true
  },
  {
    version: '1.2.0-porpoise-ABCDE',
    installed: false
  }
]
describe('VersionSelector', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })
  test('renders VersionSelector component', async () => {
    await act(async () => {
      render(<VersionSelector availableVersions={mockVersions} selectedVersion={getLatestVersion(mockVersions)} setSelectedVersion={jest.fn()}></VersionSelector>)
    })
    expect(screen.getByDisplayValue(mockVersions[0].version)).toBeEnabled()
    expect(screen.getByText('What\'s new?')).toBeVisible()
    expect(screen.getByText('Breaking changes')).toBeVisible()
  })

  test('renders VersionSelector without breaking changes and release notes button', async () => {
    await act(async () => {
      render(<VersionSelector availableVersions={mockVersions} selectedVersion={mockVersions[1]} setSelectedVersion={jest.fn()}></VersionSelector>)
    })
    expect(screen.getByDisplayValue(mockVersions[1].version)).toBeEnabled()
    expect(screen.queryAllByText('What\'s new?')).toHaveLength(0)
    expect(screen.queryAllByText('Breaking changes')).toHaveLength(0)
  })

  test('Click on version combobox', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(<VersionSelector availableVersions={mockVersions} selectedVersion={mockVersions[0]} setSelectedVersion={jest.fn()}></VersionSelector>)
    })

    // open selection
    const versionSelect = screen.getByText(mockVersions[0].version + ' (installed)')
    await user.click(versionSelect)

    // choose the older version
    const oldVersion = screen.getByText(mockVersions[1].version)
    await user.click(oldVersion)
  })

  test('Click on release notes button', async () => {
    const closeSpy = jest.fn()
    window.open = jest.fn().mockReturnValue({ close: closeSpy })
    const user = userEvent.setup()
    await act(async () => {
      render(<VersionSelector availableVersions={mockVersions} selectedVersion={mockVersions[0]} setSelectedVersion={jest.fn()}></VersionSelector>)
    })

    const releaseNotesButton = screen.getByText('What\'s new?')
    await user.click(releaseNotesButton)

    expect(window.open).toHaveBeenCalled()
    expect(window.open).toHaveBeenCalledWith(mockVersions[0].release_notes)
  })

  test('Click on breaking changes button', async () => {
    const closeSpy = jest.fn()
    window.open = jest.fn().mockReturnValue({ close: closeSpy })
    const user = userEvent.setup()
    await act(async () => {
      render(<VersionSelector availableVersions={mockVersions} selectedVersion={mockVersions[0]} setSelectedVersion={jest.fn()}></VersionSelector>)
    })

    const breakingChangesButton = screen.getByText('Breaking changes')
    await user.click(breakingChangesButton)

    expect(window.open).toHaveBeenCalled()
    expect(window.open).toHaveBeenCalledWith(mockVersions[0].breaking_changes)
  })

  test('Test createVersion', async () => {
    const versions = createVersions(['1.3.0-porpoise-ABCDE', '1.2.0-porpoise-ABCDE'], '1.3.0-porpoise-ABCDE')
    expect(versions).toHaveLength(2)
    expect(versions[0].version).toBe('1.3.0-porpoise-ABCDE')
    expect(versions[0].installed).toBeTruthy()
  })
})
