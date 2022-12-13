/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Oct 13 2022
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

async function postExportApps (apps, instances) {
  return new Promise((resolve, reject) => {
    (apps && instances)

      ? resolve('successfully exported all apps and instances. You may download them now.')
      : reject(new Error('apps and instances are missing'))
  })
}

async function getExports () {
  return new Promise((resolve, reject) => { resolve(['latestExport', 'midExport', 'oldestExport']) })
}

async function getDownloadExport (exportFile) {
  const blob = new Blob()
  return new Promise((resolve, reject) => {
    (exportFile)

      ? resolve(blob)
      : reject(new Error('exportFile is missing'))
  })
}

async function downloadLatestExport (apps, instances) {
  const blob = new Blob()
  return new Promise((resolve, reject) => {
    resolve(blob)
  })
}

export { postExportApps, getExports, getDownloadExport, downloadLatestExport }
