/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Apr 07 2022
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
function getInstanceDetails(instanceId) {
  return new Promise((resolve, reject) => {
    resolve({
      additionalInfo: 'string',
      app: 'tech.flecs.app',
      conffiles: [
        {
          container: '/etc/conf.d/configuration.cfg',
          host: '/var/lib/flecs/instances/0123abcd/conf/configuration.cfg',
        },
      ],
      hostname: 'flecs-0123abcd',
      instanceId: '87654fed',
      ipAdddress: '172.21.0.2',
      mounts: [
        {
          container: '/path/to/dir',
          host: '/path/to/host/dir',
        },
      ],
      ports: [
        {
          container: '8080',
          host: '18080',
        },
      ],
      version: 'v4.0.6',
      volumes: [
        {
          name: 'var',
          path: '/var/app',
        },
      ],
    });
  });
}

export { getInstanceDetails };
