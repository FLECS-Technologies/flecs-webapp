/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Dec 09 2022
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
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Import from '../Import'
import { postImportApps } from '../../api/device/ImportAppsService'
import { OnboardingDeviceAPI } from '../../api/device/onboarding/onboarding'
import { ReferenceDataContext } from '../../data/ReferenceDataContext'
import { JobsContext } from '../../data/JobsContext'
import {
  mockJob,
  mockQueuedJob,
  mockSuccessJob
} from '../../types/__mocks__/job'

jest.mock('../../api/device/ImportAppsService')
jest.mock('../../api/device/onboarding/onboarding')

const renderWithContext = (
  ui: React.ReactElement,
  { referenceDataValues, jobsDataValues }: any
) => {
  return render(
    <ReferenceDataContext.Provider value={referenceDataValues}>
      <JobsContext.Provider value={jobsDataValues}>{ui}</JobsContext.Provider>
    </ReferenceDataContext.Provider>
  )
}

describe('Import component', () => {
  const mockFetchJobs = jest.fn()
  const mockFetchJobById = jest.fn()
  const mockSetUpdateAppList = jest.fn()
  const mockJobs = [mockQueuedJob, mockJob, mockSuccessJob]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders Import component', () => {
    renderWithContext(<Import />, {
      referenceDataValues: { setUpdateAppList: mockSetUpdateAppList },
      jobsDataValues: {
        jobs: mockJobs,
        fetchJobs: mockFetchJobs,
        fetchJobById: mockFetchJobById
      }
    })

    expect(screen.getByText('Import')).toBeInTheDocument()
  })

  test('handles JSON file upload and shows success snackbar', async () => {
    renderWithContext(<Import />, {
      referenceDataValues: { setUpdateAppList: mockSetUpdateAppList },
      jobsDataValues: {
        jobs: mockJobs,
        fetchJobs: mockFetchJobs,
        fetchJobById: mockFetchJobById
      }
    })

    const file = new File(['{"key":"value"}'], 'test.json', {
      type: 'application/json'
    })
    const input = screen.getByTestId('fileInput')

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => expect(mockFetchJobs).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(mockSetUpdateAppList).toHaveBeenCalledWith(true))
    await waitFor(() =>
      expect(
        screen.getByText('Importing finished successfully')
      ).toBeInTheDocument()
    )
  })

  test('handles tar.gz file upload and shows success snackbar', async () => {
    renderWithContext(<Import />, {
      referenceDataValues: { setUpdateAppList: mockSetUpdateAppList },
      jobsDataValues: {
        jobs: mockJobs,
        fetchJobs: mockFetchJobs,
        fetchJobById: mockFetchJobById
      }
    })

    const file = new File(['dummy content'], 'test.tar.gz', {
      type: 'application/gzip'
    })
    const input = screen.getByTestId('fileInput')

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => expect(mockFetchJobs).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(mockSetUpdateAppList).toHaveBeenCalledWith(true))
    await waitFor(() =>
      expect(
        screen.getByText('Importing finished successfully')
      ).toBeInTheDocument()
    )
  })

  test('handles unsupported file type upload', () => {
    renderWithContext(<Import />, {
      referenceDataValues: { setUpdateAppList: mockSetUpdateAppList },
      jobsDataValues: {
        jobs: mockJobs,
        fetchJobs: mockFetchJobs,
        fetchJobById: mockFetchJobById
      }
    })

    const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' })
    const input = screen.getByTestId('fileInput')

    fireEvent.change(input, { target: { files: [file] } })

    expect(
      screen.queryByText(
        'Unsupported file type. Please upload a .tar.gz or .json file.'
      )
    ).toBeInTheDocument()
  })

  test('shows error snackbar on API failure', async () => {
    const spyOnboardingDeviceAPI = jest.spyOn(
      require('../../api/device/onboarding/onboarding'),
      'OnboardingDeviceAPI'
    )
    spyOnboardingDeviceAPI.mockImplementationOnce(() =>
      Promise.reject(new Error('Network Error'))
    )

    renderWithContext(<Import />, {
      referenceDataValues: { setUpdateAppList: mockSetUpdateAppList },
      jobsDataValues: {
        jobs: mockJobs,
        fetchJobs: mockFetchJobs,
        fetchJobById: mockFetchJobById
      }
    })

    const file = new File(['{"key":"value"}'], 'test.json', {
      type: 'application/json'
    })
    const input = screen.getByTestId('fileInput')

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => expect(spyOnboardingDeviceAPI).toHaveBeenCalledTimes(1))
    await waitFor(() =>
      expect(screen.getByText('Network Error')).toBeInTheDocument()
    )
  })
})
