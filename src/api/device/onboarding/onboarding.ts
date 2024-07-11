/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Jul 11 2024
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
import axios from 'axios'
import { DeviceAPIConfiguration } from '../../api-config'

export interface OnboardingDeviceAPIResponse {
  jobId: number
}

export async function OnboardingDeviceAPI(file: File) {
  const fileContent = await file.text()
  const jsonData = JSON.parse(fileContent)
  return axios
    .post(
      DeviceAPIConfiguration.TARGET +
        DeviceAPIConfiguration.DEVICE_BASE_ROUTE +
        DeviceAPIConfiguration.POST_ONBOARDING_URL,
      jsonData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    .then((response) => {
      return response.data as OnboardingDeviceAPIResponse
    })
    .catch((error) => {
      return Promise.reject(error)
    })
}
