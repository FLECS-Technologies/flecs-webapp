/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Apr 11 2022
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
import React, { createContext, ReactNode } from 'react'
import PropTypes from 'prop-types'
import JobsAPI from '../api/device/JobsAPI'
import { getExports } from '../api/device/ExportAppsService'
import { Job } from '../models/job'

interface JobsContextType {
  jobs: Job[]
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>
  fetchJobs: () => Promise<void>
  setFetchingJobs: React.Dispatch<React.SetStateAction<boolean>>
  fetchingJobs: boolean
  deleteJobs: (id: number) => Promise<void>
  exports: string[]
  fetchExports: () => Promise<void>
  fetchJobById: (id: number) => Promise<void>
}

const JobsContext = createContext<JobsContextType | undefined>(undefined)

export const useJobContext = (): JobsContextType => {
  const context = React.useContext(JobsContext)
  if (!context) {
    throw new Error('useJobContext must be used within a JobProvider')
  }
  return context
}

const JobsContextProvider = ({ children }: { children: ReactNode }) => {
  const [jobs, setJobs] = React.useState<Job[]>([])
  const [fetchingJobs, setFetchingJobs] = React.useState(false)
  const [exports, setExports] = React.useState([])

  React.useEffect(() => {
    if (jobs?.length === 0) {
      fetchJobs()
    }
  }, [])

  React.useEffect(() => {
    if (fetchingJobs) {
      const timer = setInterval(() => fetchJobs(), 500)
      return () => {
        clearInterval(timer)
      }
    }
  }, [fetchingJobs])

  const fetchJobs = async () => {
    const jobsAPI = new JobsAPI()
    await jobsAPI.getJobs()
    setJobs(jobsAPI.state.responseData || [])
  }

  const deleteJobs = async (id: number) => {
    const jobsAPI = new JobsAPI()
    await jobsAPI.deleteJob(id)
    fetchJobs()
  }

  const fetchExports = async () => {
    await getExports()
      .then((exports) => setExports(exports))
      .catch(() => {})
  }

  const fetchJobById = async (id: number) => {
    try {
      const jobsAPI = new JobsAPI()
      await jobsAPI.getJob(id)
      const response = jobsAPI.state.responseData as unknown as Job
      if (response) {
        setJobs((prevJobs) => {
          const jobIndex = prevJobs.findIndex((job) => job.id === id)
          if (jobIndex !== -1) {
            const updatedJobs = [...prevJobs]
            updatedJobs[jobIndex] = response
            return updatedJobs
          } else {
            return [...prevJobs, response]
          }
        })
      }
    } catch (error) {
      console.error('Failed to fetch job', error)
    }
  }

  return (
    <JobsContext.Provider
      value={{
        jobs,
        setJobs,
        fetchJobs,
        setFetchingJobs,
        fetchingJobs,
        deleteJobs,
        exports,
        fetchExports,
        fetchJobById
      }}
    >
      {children}
    </JobsContext.Provider>
  )
}

function useJobsContext(): JobsContextType {
  const context = React.useContext(JobsContext)

  if (context === undefined) {
    throw new Error('useJobsContext must be used within a JobsProvider')
  }

  return context
}

export { JobsContext, JobsContextProvider, useJobsContext }
