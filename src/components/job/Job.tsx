/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Jun 10 2024
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
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
import { useJobsContext } from '../../data/JobsContext'
import { Job as Job_Type } from '../../types/job'
import { Typography } from '@mui/material'

interface JobProps {
  jobId: number
  setStatus: React.Dispatch<React.SetStateAction<string>>
  displayResult: boolean
}

const Job: React.FC<JobProps> = ({ jobId, setStatus, displayResult }) => {
  const { jobs, fetchJobById, fetchJobs } = useJobsContext()
  const [job, setJob] = React.useState<Job_Type>()

  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (jobId > 0) {
      // Start polling
      interval = setInterval(async () => {
        await fetchJobById(jobId)
      }, 2000) // Poll every 2 seconds
      const findJob = jobs.find((job) => job.id === jobId)

      if (findJob) {
        setJob(findJob)
        setStatus(findJob.status)
        if (findJob.status === 'successful' || findJob.status === 'failed')
          clearInterval(interval)
      }
    } else {
      fetchJobs()
    }
    return () => clearInterval(interval) // Cleanup interval on component unmount
  }, [jobId, jobs, job])

  return (
    <>
      {job && (
        <React.Fragment>
          {job.status === 'queued' && (
            <Typography>{`${job.description} is queued...`}</Typography>
          )}
          {job.status === 'running' && (
            <Typography>
              {`${job.description}: ${job.currentStep.description} (step ${job.currentStep.num} of ${job.numSteps})...`}
            </Typography>
          )}
          {displayResult && (
            <React.Fragment>
              {job.status === 'successful' && (
                <Typography>
                  {`${job.description} successfully finished!`}
                </Typography>
              )}
              {job.status === 'failed' && (
                <Typography>
                  {`${job.description} failed: ${job.result}!`}
                </Typography>
              )}
            </React.Fragment>
          )}
        </React.Fragment>
      )}
    </>
  )
}

export default Job
