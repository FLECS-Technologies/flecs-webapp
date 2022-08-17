/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Jan 19 2022
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
function authHeaderUseBearer () {
  return { Authentication: 'Bearer ABCDEFG' }
}

function authorizationHeaderUseBearer () {
  return { Authorization: 'Bearer ABCDEFG' }
}

function authHeaderUseXAccess () {
  // for Node.js Express back-end
  return 'x-access-tokenABCDEFG'
}

function jwt () {
  return 'ABCDEFG'
}

export { authHeaderUseBearer, authorizationHeaderUseBearer, authHeaderUseXAccess, jwt }
