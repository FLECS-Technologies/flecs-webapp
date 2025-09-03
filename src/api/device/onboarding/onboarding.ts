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
import axios from 'axios';
import { createApi } from '../../flecs-core/api-client';

export interface OnboardingDeviceAPIResponse {
  jobId: number;
}

export async function OnboardingDeviceAPI(file: File, api: ReturnType<typeof createApi>) {
  const fileContent = await file.text();
  const jsonData = JSON.parse(fileContent);

  return api.device
    .deviceOnboardingPost(jsonData)
    .then((response: any) => {
      return response.data as OnboardingDeviceAPIResponse;
    })
    .catch((error: any) => {
      return Promise.reject(error);
    });
}
