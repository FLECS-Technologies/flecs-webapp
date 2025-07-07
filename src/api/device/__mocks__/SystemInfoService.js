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
function SystemInfo() {
  return new Promise((resolve, reject) => {
    resolve({
      arch: 'amd64',
      distro: {
        codename: 'jammy',
        id: 'ubuntu',
        name: 'Ubuntu 22.04 LTS',
        version: '22.04',
      },
      kernel: {
        build: '#25-Ubuntu SMP Thu Sep 1 18:19:31 UTC 2022',
        machine: 'x86_64',
        version: '5.15.0-1020-azure',
      },
      platform: 'flecs',
    });
  });
}

export { SystemInfo };
