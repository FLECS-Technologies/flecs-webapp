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
import GetJobsAPI from '../api/device/JobsAPI'

const JobsContext = createContext([])

function JobsContextProvider (props) {
  const [jobs, setJobs] = React.useState([])
  const [hiddenJobs, setHiddenJobs] = React.useState([])

  React.useEffect(() => {
    if (jobs?.length === 0) {
      fetchJobs()
    }
  }, [setJobs])

  React.useEffect(() => {
    if (jobs.length > 0) {
      if (jobs.filter(j => j.status === 'running').length > 0) {
        const timer = setInterval(
          () =>
            fetchJobs(),
          500
        )
        return () => {
          clearInterval(timer)
        }
      }
    }
  }, [setJobs])

  React.useEffect(() => {
    const timer = setInterval(
      () =>
        jobs.filter(j => (j.status === 'queued' || j.status === 'pending' || j.status === 'running')).length > 0
          ? fetchJobs()
          : null,
      500
    )
    return () => {
      clearInterval(timer)
    }
  })

  const fetchJobs = async () => {
    const getJobs = new GetJobsAPI()
    await getJobs.getJobs()
    setJobs(getJobs.state.responseData)
  }

  const hideJobs = (jobs) => {
    if (typeof jobs === 'number') {
      setHiddenJobs([...hiddenJobs, jobs])
    } else if (typeof jobs === 'object') {
      setHiddenJobs(hiddenJobs.concat(jobs))
    }
  }

  const currentInstallations = () => {
    return jobs.filter(j => (j.description.includes('Installing') && (j.status === 'running' || j.status === 'queued' || j.status === 'pending'))).length
  }

  return (
    <JobsContext.Provider value={{ jobs, setJobs, fetchJobs, hiddenJobs, hideJobs, currentInstallations }}>
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
