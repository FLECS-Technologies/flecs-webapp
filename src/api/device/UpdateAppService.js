/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Oct 13 2022
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
import PostInstallAppAPI from './InstallAppAPI'
import { UpdateInstanceService } from './UpdateInstanceService'
import GetJobsAPI from './JobsAPI'
import { sleep } from '../../utils/sleep'

async function UpdateAppService (app, from, to, licenseKey, instances, handleInstallationJob) {
  const jobStatus = await installApp(app, to, licenseKey, handleInstallationJob)
  if (jobStatus === 'successful') {
    // migrate instances to the new version
    let responses = Promise.resolve('App successfully updated.')
    if (instances && instances.length > 0) {
      responses = await Promise.all(
        instances.map(async instance => {
          await UpdateInstanceService(app, instance.instanceId, '', to)
        })
      )
      return responses
    }
  }
}

const installApp = async (app, version, licenseKey, handleInstallationJob) => {
  let jobStatus
  try {
    if (app) {
      const installAPI = new PostInstallAppAPI()
      await installAPI.installApp(app, version, licenseKey)
      const jobId = installAPI.state.responseData.jobId
      jobStatus = await waitUntilJobIsComplete(jobId, handleInstallationJob)

      if (jobStatus !== 'successful') {
        throw Error('failed to install app.' + installAPI.state.errorMessage.message)
      }
    }
  } catch (error) {
    console.error(error)
  }
  await sleep(2000)
  return jobStatus
}

const waitUntilJobIsComplete = async (jobId, handleInstallationJob) => {
  const getJobsAPI = new GetJobsAPI()
  await getJobsAPI.getJob(jobId)
  let jobStatus = getJobsAPI.state.responseData[0].status
  handleInstallationJob(jobStatus)

  while (jobStatus !== 'successful' && jobStatus !== 'failed' && jobStatus !== 'cancelled') {
    await getJobsAPI.getJob(jobId)
    jobStatus = getJobsAPI.state.responseData[0].status
    handleInstallationJob(jobStatus)
    await sleep(500)
  }
  return jobStatus
}

export { UpdateAppService }
