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

async function UpdateAppService (app, from, to, licenseKey, instances) {
  // install new version
  const installAPI = new PostInstallAppAPI()

  await installAPI.installApp(app, to, licenseKey)
  if (!installAPI.state.success) {
    return Promise.reject(Error(installAPI.state.errorMessage.message))
  }

  // migrate instances to the new version
  let responses = Promise.resolve('App successfully updated.')
  if (instances && instances.length > 0) {
    responses = await Promise.all(
      instances.map(async instance => {
        await UpdateInstanceService(app, instance.instanceId, '', to)
      })
    )
  }

  return responses
}

export { UpdateAppService }
