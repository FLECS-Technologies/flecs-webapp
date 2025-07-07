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
import { OnboardingDeviceAPIResponse } from '../onboarding';

export const mockActivateDeviceAPIResponse = {
  jobId: 2,
} as OnboardingDeviceAPIResponse;

function OnboardingDeviceAPI(file?: File) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('File is undefined'));
    } else {
      resolve(mockActivateDeviceAPIResponse);
    }
  });
}

export { OnboardingDeviceAPI };
