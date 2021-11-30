/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Nov 30 2021
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

import React from 'react'

export default class BaseAPI extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      responseData: null,
      errorMessage: null
    }
  }

  async callAPI (apiURL, requestOptions) {
    fetch(apiURL, requestOptions)
      .then(async (response) => {
        const isJson = response.headers
          .get('content-type')
          ?.includes('application/json')
        const data = isJson && (await response.json())

        // check for error response
        if (!response.ok /* response.headers.status !== 200 */) {
          // get error message from body or default to response status
          const error = (data && data.additionalInfo) || response.status
          return Promise.reject(error)
        }

        this.setState({ responseData: data })
        return response.ok
      })
      .catch((error) => {
        this.setState({ errorMessage: error })
        console.error('There was an error!', error)
      })
  }
}
