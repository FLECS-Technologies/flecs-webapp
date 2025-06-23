/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Fri Feb 24 2021
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
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import { render, screen } from '@testing-library/react'
import BasicTable from '../AppBarTable'
import { JobsContextProvider } from '../../data/JobsContext'
import { mockJob, mockSuccessJob } from '../../models/__mocks__/job'

const jobs = [mockJob, mockSuccessJob]

describe('AppBarTable', () => {
  test('renders AppBarTable component', async () => {
    await act(async () => {
      render(
        <JobsContextProvider>
          <BasicTable jobs={[]}></BasicTable>
        </JobsContextProvider>
      )
    })
    expect(screen.getByText('Installation Log')).toBeVisible()
    expect(screen.getByText('Clear All')).toBeVisible()
  })

  test('click on Clear All button', async () => {
    const clearAllFinishedJobs = jest.fn()
    const deleteJobs = jest.fn()
    const user = userEvent.setup()
    await act(async () => {
      render(
        <JobsContextProvider>
          <BasicTable
            jobs={[]}
            deleteJobs={deleteJobs}
            clearAllFinishedJobs={clearAllFinishedJobs}
            clearAllButtonIsDisabled={false}
          />
        </JobsContextProvider>
      )
    })
    expect(screen.getByText('Clear All')).toBeVisible()
    const clearAllButton = screen.getByText('Clear All')
    await user.click(clearAllButton)
    expect(clearAllFinishedJobs).toHaveBeenCalled()
  })

  test('render with jobs', async () => {
    await act(async () => {
      render(
        <JobsContextProvider>
          <BasicTable jobs={jobs} />
        </JobsContextProvider>
      )
    })

    expect(screen.getByText(jobs[0].status)).toBeVisible()
    expect(screen.getByText(jobs[1].status)).toBeVisible()
  })

  test('render with jobs and click on Clear', async () => {
    const deleteJobs = jest.fn()
    const clearAllFinishedJobs = jest.fn()
    const user = userEvent.setup()
    await act(async () => {
      render(
        <JobsContextProvider>
          <BasicTable
            jobs={jobs}
            deleteJobs={deleteJobs}
            clearAllFinishedJobs={clearAllFinishedJobs}
            clearAllButtonIsDisabled={true}
          />
        </JobsContextProvider>
      )
    })

    const clearButton = screen.getAllByTestId('icon-button')
    await user.click(clearButton[0]) // [0] is somehow the last button created and that job has status 'successful', so it can be clicked
    expect(deleteJobs).toHaveBeenCalled()
  })
})
