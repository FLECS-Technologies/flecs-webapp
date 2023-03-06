/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Feb 24 2022
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
import nock from 'nock'
import '@testing-library/jest-dom'
import JobsAPI from '../JobsAPI'
import { DeviceAPIConfiguration } from '../../api-config'

const jobs = [
  {
    id: 1,
    description: 'Went fishing',
    status: 'successful'
  },
  {
    id: 2,
    description: 'Do the laundry',
    status: 'failed'
  },
  {
    id: 3,
    description: 'Repair sink',
    status: 'pending'
  },
  {
    id: 4,
    description: 'Drive home',
    status: 'running'
  }
]

describe('JobsAPI', () => {
  beforeEach(() => {
    nock.disableNetConnect()
    nock.enableNetConnect('127.0.0.1')
  })
  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  test('calls successful JobsAPI.getJobs', async () => {
    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.GET_JOBS_URL)
      .reply(200, jobs)
    const jobsAPI = new JobsAPI()
    await jobsAPI.getJobs()

    expect(jobsAPI.state.success).toBeTruthy()
    expect(jobsAPI.state.responseData).toHaveLength(4)
  })

  test('calls failed JobsAPI.getJobs', async () => {
    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.GET_JOBS_URL)
      .reply(400, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    const jobsAPI = new JobsAPI()
    await jobsAPI.getJobs()

    expect(jobsAPI.state.success).toBeFalsy()
    expect(jobsAPI.state.responseData).toBeNull()
  })

  test('calls successful JobsAPI.getJob', async () => {
    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.GET_JOBS_URL + '/' + jobs[0].id)
      .reply(200, jobs[0])
    const jobsAPI = new JobsAPI()
    await jobsAPI.getJob(jobs[0].id)

    expect(jobsAPI.state.success).toBeTruthy()
    expect(jobsAPI.state.responseData.id).toBe(jobs[0].id)
  })

  test('calls failed JobsAPI.getJob', async () => {
    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.GET_JOBS_URL + '/' + jobs[0].id)
      .reply(400, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    const jobsAPI = new JobsAPI()
    await jobsAPI.getJob(jobs[0].id)

    expect(jobsAPI.state.success).toBeFalsy()
    expect(jobsAPI.state.responseData).toBeNull()
  })

  test('calls successful JobsAPI.deleteJob', async () => {
    nock('http://localhost')
      .delete(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.GET_JOBS_URL + '/' + jobs[0].id)
      .reply(200)
    const jobsAPI = new JobsAPI()
    await jobsAPI.deleteJob(jobs[0].id)

    expect(jobsAPI.state.success).toBeTruthy()
    expect(jobsAPI.state.responseData).toBeUndefined()
  })

  test('calls failed JobsAPI.deleteJob', async () => {
    nock('http://localhost')
      .delete(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.GET_JOBS_URL + '/' + jobs[0].id)
      .reply(400, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    const jobsAPI = new JobsAPI()
    await jobsAPI.deleteJob(jobs[0].id)

    expect(jobsAPI.state.success).toBeFalsy()
    expect(jobsAPI.state.responseData).toBeNull()
  })
})
