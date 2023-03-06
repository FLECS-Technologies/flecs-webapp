/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Dec 09 2022
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
import { DeviceAPIConfiguration } from '../api-config'

async function postImportApps (file, fileName) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const url = DeviceAPIConfiguration.TARGET + DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.POST_APP_IMPORT_URL
    xhr.open('POST', url, true)
    xhr.setRequestHeader('X-Uploaded-Filename', fileName)
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 202) {
          resolve(xhr.responseText)
          return xhr.response
        } else {
          reject(xhr.statusText)
        }
      }
    }
    xhr.send(file)
  })
}

export { postImportApps }
