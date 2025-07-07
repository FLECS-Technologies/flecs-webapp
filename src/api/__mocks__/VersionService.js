/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Jun 01 2022
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

async function getVersion() {
  return new Promise((resolve, reject) => {
    resolve({
      core: '1.1.0-porpoise-475591c',
    });
  });
}

async function getLatestVersion() {
  return new Promise((resolve, reject) => {
    resolve({
      success: true,
      version: '1.1.0-porpoise-475591c',
      release_notes: 'www.release-notes.com',
    });
  });
}

function isLaterThan(version1, version2) {
  return true;
}

export { getVersion, getLatestVersion, isLaterThan };
