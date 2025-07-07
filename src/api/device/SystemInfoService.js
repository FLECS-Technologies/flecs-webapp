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
import axios from 'axios';
import { DeviceAPIConfiguration } from '../api-config';

async function SystemInfo() {
  return axios
    .get(
      DeviceAPIConfiguration.TARGET +
        DeviceAPIConfiguration.DEVICE_BASE_ROUTE +
        DeviceAPIConfiguration.GET_SYSTEM_INFO_URL,
    )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return Promise.reject(error);
    });
}

export { SystemInfo };
