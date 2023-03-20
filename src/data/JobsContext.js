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
import React, { createContext } from 'react'
import PropTypes from 'prop-types'
import JobsAPI from '../api/device/JobsAPI'
import { getExports } from '../api/device/ExportAppsService'

const JobsContext = createContext([])

function JobsContextProvider (props) {
  const [jobs, setJobs] = React.useState([])
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
    setJobs(jobsAPI.state.responseData)
  }

  const deleteJobs = async (job) => {
    const jobsAPI = new JobsAPI()
    await jobsAPI.deleteJob(job)
    fetchJobs()
  }

  const currentInstallations = () => {
    return jobs?.filter(j => (j.description.includes('Installation') && (j.status === 'running' || j.status === 'queued' || j.status === 'pending'))).length
  }

  const fetchExports = async () => {
    const exports = await getExports()
    setExports(exports)
  }

  return (
    <JobsContext.Provider value={{ jobs, setJobs, setFetchingJobs, fetchingJobs, deleteJobs, currentInstallations, exports, fetchExports }}>
      {props.children}
    </JobsContext.Provider>
  )
}

function useJobsContext () {
  return React.useContext(JobsContext)
}

export { JobsContext, JobsContextProvider, useJobsContext }

JobsContextProvider.propTypes = {
  children: PropTypes.any
}
