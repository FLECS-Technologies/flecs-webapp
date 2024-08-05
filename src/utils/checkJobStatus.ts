/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Aug 02 2024
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
import JobsAPI from '../api/device/JobsAPI'
import { Job } from '../types/job'
import { sleep } from './sleep'

export async function checkJobStatus(jobId: number): Promise<string> {
  const jobsAPI = new JobsAPI()
  let jobStatus

  do {
    await jobsAPI.getJob(jobId)
    jobStatus = (jobsAPI?.state?.responseData as unknown as Job).status

    await sleep(1000)
  } while (jobStatus === 'running' || jobStatus === 'queued')

  return jobStatus
}

export async function checkAllJobStatuses(jobIds: number[]): Promise<string[]> {
  // Create an array of promises using the checkJobStatus function for each jobId
  const statusPromises = jobIds.map((jobId) => checkJobStatus(jobId))

  // Use Promise.all to wait for all promises to resolve and return the statuses
  const jobStatuses = await Promise.all(statusPromises)

  return jobStatuses
}
