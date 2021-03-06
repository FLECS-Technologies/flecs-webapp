/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Nov 30 2021
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

import BaseAPI from './BaseAPI'
import { DeviceAPIConfiguration } from './api-config'
import Yaml from 'js-yaml'

export default class PutSideloadAppAPI extends BaseAPI {
  async sideloadApp (yml, licenseKey) {
    // PUT request using fetch with error handling
    const appYaml = Yaml.dump(yml)
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, appYaml })
    }

    try {
      await this.callAPI(DeviceAPIConfiguration.APP_ROUTE + DeviceAPIConfiguration.PUT_SIDELOAD_APP, requestOptions)
    } catch (error) { }
  }
}
