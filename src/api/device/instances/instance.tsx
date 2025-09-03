/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Sep 01 2025
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
import { job_meta } from '../../../models/job';
import { createApi } from '../../flecs-core/api-client';

export interface AppInstance {
  instanceId: string;
  instanceName: string;
  appKey: AppKey;
  status: string;
  desired: string;
  editors: Editor[];
}

export interface AppKey {
  name: string;
  version: string;
}

export interface Editor {
  name: string;
  url: string;
  supportsReverseProxy: boolean;
  port: number;
}

export async function UpdateInstanceAPI(
  instanceId: string,
  to: string,
  api: ReturnType<typeof createApi>,
) {
  return api.instances
    .instancesInstanceIdPatch(instanceId, { to })
    .then((response) => {
      return (response.data as job_meta).jobId;
    })
    .catch((error) => {
      return Promise.reject(error);
    });
}

export async function UpdateInstances(
  instances: AppInstance[],
  to: string,
  api: ReturnType<typeof createApi>,
): Promise<number[]> {
  if (instances.length === 0) {
    return [];
  }

  const responses = await Promise.all(
    instances.map(async (instance) => {
      const jobId = await UpdateInstanceAPI(instance.instanceId, to, api);
      return jobId;
    }),
  );

  return responses;
}
