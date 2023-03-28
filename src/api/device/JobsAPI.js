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
import { DeviceAPIConfiguration } from '../api-config'

export default class JobsAPI extends BaseAPI {
  async getJobs () {
    // GET request using fetch with error handling
    const requestOptions = {
      method: 'GET'
    }

    try {
      await this.callAPI(DeviceAPIConfiguration.JOBS_ROUTE, requestOptions)
    } catch (error) { }
  }

  async getJob (jobId) {
    // GET request using fetch with error handling
    const requestOptions = {
      method: 'GET'
    }

    try {
      await this.callAPI(DeviceAPIConfiguration.GET_JOB_URL(jobId), requestOptions)
    } catch (error) { }
  }

  async deleteJob (jobId) {
    // DELETE request using fetch with error handling
    const requestOptions = {
      method: 'DELETE'
    }

    try {
      await this.callAPI(DeviceAPIConfiguration.DELETE_JOB_URL(jobId), requestOptions)
    } catch (error) { }
  }
}
