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
function authHeaderUseBearer() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.jwt && user.jwt.token) {
    return { Authentication: 'Bearer ' + user.jwt.token };
  } else {
    return {};
  }
}

function authorizationHeaderUseBearer() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.jwt && user.jwt.token) {
    return { Authorization: 'Bearer ' + user.jwt.token };
  } else {
    return {};
  }
}

function authHeaderUseXAccess() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.jwt && user.jwt.token) {
    // for Node.js Express back-end
    return { 'x-access-token': user.jwt.token };
  } else {
    return {};
  }
}

function jwt() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.jwt && user.jwt.token) {
    return user.jwt.token;
  } else {
    return {};
  }
}

export { authHeaderUseBearer, authorizationHeaderUseBearer, authHeaderUseXAccess, jwt };
