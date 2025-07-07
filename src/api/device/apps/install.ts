/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Thu Aug 01 2024
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
import { DeviceAPIConfiguration } from '../../api-config';
import { job_meta } from '../../../models/job';

export async function InstallAppAPI(app: string, version: string) {
  return axios
    .post(
      DeviceAPIConfiguration.TARGET +
        DeviceAPIConfiguration.DEVICE_BASE_ROUTE +
        DeviceAPIConfiguration.APP_ROUTE +
        DeviceAPIConfiguration.POST_INSTALL_APP_URL,
      JSON.stringify({ appKey: { name: app, version } }),
    )
    .then((response) => {
      return (response.data as job_meta).jobId;
    })
    .catch((error) => {
      return Promise.reject(error);
    });
}
