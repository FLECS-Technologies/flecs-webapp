/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Apr 16 2025
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
import {
  AppsApi,
  ConsoleApi,
  DeploymentsApi,
  DeviceApi,
  FlecsportApi,
  InstancesApi,
  JobsApi,
  QuestsApi,
  Configuration,
  SystemApi,
} from '@flecs/core-client-ts';

export function createApi(config: Configuration) {
  return {
    app: new AppsApi(config),
    device: new DeviceApi(config),
    console: new ConsoleApi(config),
    deployments: new DeploymentsApi(config),
    export: new FlecsportApi(config),
    instances: new InstancesApi(config),
    jobs: new JobsApi(config),
    system: new SystemApi(config),
    quests: new QuestsApi(config),
  };
}

function getBaseURL(): string {
  return host() + baseURL();
}

function host() {
  let target = '';
  if (import.meta.env.VITE_APP_ENVIRONMENT === 'development') {
    target = import.meta.env.VITE_APP_DEV_CORE_URL || '';
  }
  return target;
}

function baseURL() {
  if (
    import.meta.env.VITE_APP_ENVIRONMENT === 'test' ||
    import.meta.env.VITE_APP_ENVIRONMENT === 'development'
  ) {
    return '/api/v2';
  }
  return '../api/v2';
}

const config = new Configuration({ basePath: getBaseURL() });

export const api = createApi(config);
